package repository

import (
	"context"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"

	"github.com/octohelm/kubepkg/pkg/auth"
	"github.com/octohelm/kubepkg/pkg/datatypes"
	"github.com/octohelm/storage/pkg/dal"
	"github.com/octohelm/storage/pkg/dberr"
	"github.com/octohelm/storage/pkg/sqlbuilder"
)

func NewAccountExchanger() *AccountExchanger {
	return &AccountExchanger{
		AccountRepository: NewAccountRepository(),
	}
}

type AccountExchanger struct {
	*AccountRepository
}

func (e AccountExchanger) Exchange(ctx context.Context, from string, user auth.UserInfo, createIfNotExists bool) ([]string, error) {
	vi := &account.VendorIdentity{}

	err := dal.From(account.VendorIdentityT).
		Where(sqlbuilder.And(
			account.VendorIdentityT.VendorIdentityFrom.V(sqlbuilder.Eq(from)),
			account.VendorIdentityT.VendorIdentity.V(sqlbuilder.Eq(user.ID())),
		)).
		Join(account.AccountT, sqlbuilder.And(
			account.AccountT.AccountID.V(sqlbuilder.EqCol(account.VendorIdentityT.AccountID)),
			account.AccountT.DeletedAt.V(sqlbuilder.Eq(datatypes.TimestampZero)),
		)).
		Scan(vi).
		Find(ctx)
	if err != nil {
		if !dberr.IsErrNotFound(err) {
			return nil, err
		}
		if !createIfNotExists {
			return nil, err
		}
	}

	total, err := dal.From(account.AccountT).Limit(1).Count(ctx)
	if err != nil {
		return nil, err
	}

	if err := dal.Tx(ctx, vi, func(ctx context.Context) error {
		u, err := e.PutUser(ctx, account.UserInfo{
			Email:    user.Email(),
			Nickname: user.Nickname(),
			Mobile:   user.Mobile(),
		}, vi.AccountID)
		if err != nil {
			return err
		}

		if u.AccountID != vi.AccountID {
			vi.AccountID = u.AccountID

			vi.VendorIdentityFrom = from
			vi.VendorIdentity = user.ID()
			return dal.Prepare(vi).Save(ctx)
		}
		return nil
	}); err != nil {
		return nil, err
	}

	if total == 0 {
		return []string{
			vi.AccountID.String(),
			account.TYPE__USER.String(),
			"ADMIN_INIT",
		}, nil
	}

	return []string{
		vi.AccountID.String(),
		account.TYPE__USER.String(),
	}, nil
}
