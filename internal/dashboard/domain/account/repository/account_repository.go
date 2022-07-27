package repository

import (
	"context"

	"github.com/octohelm/kubepkg/pkg/datatypes"
	b "github.com/octohelm/storage/pkg/sqlbuilder"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"
	"github.com/octohelm/kubepkg/pkg/idgen"
	"github.com/octohelm/storage/pkg/dal"
)

func NewAccountRepository() *AccountRepository {
	return &AccountRepository{}
}

type AccountRepository struct {
}

func (*AccountRepository) updateIdentity(ctx context.Context, ai *account.Identity) error {
	return dal.Prepare(ai).
		OnConflict(account.IdentityT.I.IAccountIdentity).
		DoUpdateSet(account.IdentityT.AccountID).
		Returning(
			account.IdentityT.CreatedAt,
			account.IdentityT.UpdatedAt,
		).Scan(ai).
		Save(ctx)
}

func (repo *AccountRepository) PutUser(ctx context.Context, userInfo account.UserInfo, accountID account.ID) (*account.User, error) {
	user := &account.User{}
	user.AccountID = accountID
	user.AccountType = account.TYPE__USER
	user.UserInfo = userInfo

	if user.AccountID == 0 {
		accountID, err := idgen.FromContextAndCast[account.ID](ctx).ID()
		if err != nil {
			return nil, err
		}
		user.AccountID = accountID
	}

	emailIdentity := &account.Identity{
		AccountID:    user.AccountID,
		IdentityType: account.IDENTITY_TYPE__EMAIL,
		Identity:     user.Email,
	}

	if err := dal.Tx(ctx, emailIdentity, func(ctx context.Context) error {
		if err := dal.Prepare(emailIdentity).
			OnConflict(account.IdentityT.I.IAccountIdentity).
			DoNothing().
			Returning(
				account.IdentityT.AccountID,
				account.IdentityT.CreatedAt,
				account.IdentityT.UpdatedAt,
			).
			Scan(emailIdentity).
			Save(ctx); err != nil {
			return err
		}

		if emailIdentity.AccountID != user.AccountID {
			user.AccountID = emailIdentity.AccountID
		}

		if err := dal.Prepare(&user.Account).
			OnConflict(account.AccountT.I.IAccount).DoNothing().
			Returning(
				account.AccountT.CreatedAt,
				account.AccountT.UpdatedAt,
			).
			Scan(&user.Account).
			Save(ctx); err != nil {
			return err
		}

		// always sync mobile and nickname;
		if mobile := userInfo.Mobile; mobile != "" {
			if err := repo.updateIdentity(ctx, &account.Identity{
				AccountID:    user.AccountID,
				IdentityType: account.IDENTITY_TYPE__MOBILE,
				Identity:     mobile,
			}); err != nil {
				return err
			}
		}

		if nickname := userInfo.Nickname; nickname != "" {
			if err := repo.updateIdentity(ctx, &account.Identity{
				AccountID:    user.AccountID,
				IdentityType: account.IDENTITY_TYPE__NICKNAME,
				Identity:     nickname,
			}); err != nil {
				return err
			}
		}
		return nil
	}); err != nil {
		return nil, err
	}

	return user, nil
}

func (repo *AccountRepository) PutRobot(ctx context.Context, robotInfo account.RobotInfo, accountID account.ID) (*account.Robot, error) {
	robot := &account.Robot{}
	robot.AccountID = accountID
	robot.AccountType = account.TYPE__ROBOT
	robot.RobotInfo = robotInfo

	if robot.AccountID == 0 {
		accountID, err := idgen.FromContextAndCast[account.ID](ctx).ID()
		if err != nil {
			return nil, err
		}
		robot.AccountID = accountID
	}

	nameIdentity := &account.Identity{
		AccountID:    robot.AccountID,
		IdentityType: account.IDENTITY_TYPE__NICKNAME,
		Identity:     robot.Name,
	}

	if err := dal.Tx(ctx, nameIdentity, func(ctx context.Context) error {
		if err := dal.Prepare(nameIdentity).
			OnConflict(account.IdentityT.I.IAccountIdentity).
			DoNothing().
			Returning(
				account.IdentityT.AccountID,
				account.IdentityT.CreatedAt,
				account.IdentityT.UpdatedAt,
			).
			Scan(nameIdentity).
			Save(ctx); err != nil {
			return err
		}

		if nameIdentity.AccountID != robot.AccountID {
			robot.AccountID = nameIdentity.AccountID
		}

		if err := dal.Prepare(&robot.Account).
			OnConflict(account.AccountT.I.IAccount).DoNothing().
			Returning(
				account.AccountT.CreatedAt,
				account.AccountT.UpdatedAt,
			).
			Scan(&robot.Account).
			Save(ctx); err != nil {
			return err
		}

		return nil
	}); err != nil {
		return nil, err
	}

	return robot, nil
}

func (repo *AccountRepository) Add(ctx context.Context, accountType account.Type) (*account.Account, error) {
	accountID, err := idgen.FromContextAndCast[account.ID](ctx).ID()
	if err != nil {
		return nil, err
	}
	a := &account.Account{}
	a.AccountID = accountID
	a.AccountType = accountType

	if err := dal.Prepare(a).Save(ctx); err != nil {
		return nil, err
	}
	return a, nil
}

func (repo *AccountRepository) GetUser(ctx context.Context, accountID account.ID) (*account.User, error) {
	user := &account.User{}
	user.AccountID = accountID

	if err := repo.RangeIdentity(
		ctx,
		[]account.ID{accountID},
		func(i *account.Identity) error {
			user.ValueFromIdentity(i)
			return nil
		},
	); err != nil {
		return nil, err
	}

	return user, nil
}

func (repo *AccountRepository) ListUserAccount(ctx context.Context, params account.UserQueryParams) (*account.UserDataList, error) {
	r := datatypes.NewRecord[account.ID, account.User]()

	q := dal.From(account.AccountT).Where(b.And(
		account.AccountT.AccountType.V(b.Eq(account.TYPE__USER)),
		b.Or(
			account.AccountT.AccountID.V(b.In(params.AccountIDs...)),
			account.AccountT.AccountID.V(dal.InSelect(
				account.IdentityT.AccountID,
				dal.From(account.IdentityT, dal.WhereStmtNotEmpty()).Where(
					account.IdentityT.Identity.V(datatypes.RightLikeOrIn(params.Identity...)),
				),
			)),
		),
	))

	total, err := q.Count(ctx)
	if err != nil {
		return nil, err
	}

	if err := q.Limit(params.Size).Offset(params.Offset).
		Scan(dal.Recv(func(v *account.User) error {
			r.Put(v.AccountID, v)
			return nil
		})).
		Find(ctx); err != nil {
		return nil, err
	}

	if err := repo.RangeIdentity(ctx, r.Keys(), func(i *account.Identity) error {
		if v := r.Get(i.AccountID); v != nil {
			v.ValueFromIdentity(i)
		}
		return nil
	}); err != nil {
		return nil, err
	}

	return &account.UserDataList{
		Data:  r.Values(),
		Total: total,
	}, nil
}

func (repo *AccountRepository) RangeIdentity(ctx context.Context, accountIDs []account.ID, each func(i *account.Identity) error) error {
	if len(accountIDs) == 0 {
		return nil
	}

	q := dal.From(account.IdentityT).Where(b.And(
		account.IdentityT.AccountID.V(b.In(accountIDs...)),
	))
	return q.Scan(dal.Recv(each)).Find(ctx)
}
