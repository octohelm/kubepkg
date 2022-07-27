package repository

import (
	"context"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"

	"github.com/octohelm/kubepkg/pkg/idgen"

	"github.com/octohelm/storage/pkg/dal"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	"github.com/octohelm/kubepkg/pkg/datatypes"
	b "github.com/octohelm/storage/pkg/sqlbuilder"
)

func NewGroupAccountRepository(g *group.Group) *GroupAccountRepository {
	return &GroupAccountRepository{
		Group: g,
	}
}

type GroupAccountRepository struct {
	Group *group.Group
}

type GetAccountID = func(ctx context.Context) (account.ID, error)

func (r *GroupAccountRepository) Put(ctx context.Context, roleType group.RoleType, accountID account.ID) (*group.Account, error) {
	gaID, err := idgen.FromContextAndCast[datatypes.SFID](ctx).ID()
	if err != nil {
		return nil, err
	}

	ga := &group.Account{}

	ga.ID = gaID
	ga.GroupID = r.Group.ID
	ga.AccountID = accountID
	ga.RoleType = roleType

	if err := dal.Prepare(ga).
		OnConflict(group.AccountT.I.IGroupAccount).
		DoUpdateSet(
			group.AccountT.RoleType,
		).
		Returning(
			group.AccountT.CreatedAt,
			group.AccountT.UpdatedAt,
		).
		Scan(ga).
		Save(ctx); err != nil {
		return nil, err
	}

	return ga, nil
}

func (r *GroupAccountRepository) Delete(ctx context.Context, accountID account.ID) error {
	return dal.Prepare(group.AccountT).ForDelete().
		Where(b.And(
			group.AccountT.GroupID.V(b.Eq(r.Group.ID)),
			group.AccountT.AccountID.V(b.Eq(accountID)),
		)).
		Save(ctx)

}

func (r *GroupAccountRepository) List(ctx context.Context, where b.SqlExpr) ([]*group.Account, error) {
	list := make([]*group.Account, 0)

	if err := dal.From(group.AccountT).
		Where(where).
		Scan(dal.Recv(func(v *group.Account) error {
			list = append(list, v)
			return nil
		})).
		Find(ctx); err != nil {
		return nil, err
	}

	return list, nil
}

type RangeIdentity = func(ctx context.Context, ids []account.ID, each func(i *account.Identity) error) error

func (r *GroupAccountRepository) ListAccountRobot(
	ctx context.Context,
	params group.RobotQueryParams,
	rangeIdentity RangeIdentity,
) (*group.RobotDataList, error) {
	q := dal.From(group.AccountT).
		Join(account.AccountT, account.AccountT.AccountID.V(b.EqCol(group.AccountT.AccountID))).
		Where(b.And(
			group.AccountT.GroupID.V(b.Eq(r.Group.ID)),
			group.AccountT.RoleType.V(b.In(params.RoleType...)),
			account.AccountT.AccountType.V(b.Eq(account.TYPE__ROBOT)),
			b.Or(
				group.AccountT.AccountID.V(b.In(params.AccountIDs...)),
				group.AccountT.AccountID.V(dal.InSelect(
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

	record := datatypes.NewRecord[account.ID, group.Robot]()

	if err := q.Limit(params.Size).Offset(params.Offset).
		Scan(dal.Recv(func(v *group.Robot) error {
			record.Put(v.AccountID, v)
			return nil
		})).
		Find(ctx); err != nil {
		return nil, err
	}

	if rangeIdentity != nil {
		if err := rangeIdentity(ctx, record.Keys(), func(i *account.Identity) error {
			if v := record.Get(i.AccountID); v != nil {
				v.ValueFromIdentity(i)
			}
			return nil
		}); err != nil {
			return nil, err
		}
	}

	return &group.RobotDataList{
		Data:  record.Values(),
		Total: total,
	}, nil
}

func (r *GroupAccountRepository) ListAccountUser(
	ctx context.Context,
	params group.UserQueryParams,
	rangeIdentity RangeIdentity,
) (*group.UserDataList, error) {
	record := datatypes.NewRecord[account.ID, group.User]()

	q := dal.From(group.AccountT).
		Join(account.AccountT, account.AccountT.AccountID.V(b.EqCol(group.AccountT.AccountID))).
		Where(b.And(
			group.AccountT.GroupID.V(b.Eq(r.Group.ID)),
			group.AccountT.RoleType.V(b.In(params.RoleType...)),
			account.AccountT.AccountType.V(b.Eq(account.TYPE__USER)),
			b.Or(
				group.AccountT.AccountID.V(b.In(params.AccountIDs...)),
				group.AccountT.AccountID.V(dal.InSelect(
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
		Scan(dal.Recv(func(v *group.User) error {
			record.Put(v.AccountID, v)
			return nil
		})).
		Find(ctx); err != nil {
		return nil, err
	}

	if rangeIdentity != nil {
		if err := rangeIdentity(ctx, record.Keys(), func(i *account.Identity) error {
			if v := record.Get(i.AccountID); v != nil {
				v.ValueFromIdentity(i)
			}
			return nil
		}); err != nil {
			return nil, err
		}
	}

	return &group.UserDataList{
		Data:  record.Values(),
		Total: total,
	}, nil
}
