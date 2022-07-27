package repository

import (
	"context"
	"time"

	"github.com/octohelm/kubepkg/pkg/datatypes"
	b "github.com/octohelm/storage/pkg/sqlbuilder"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"
	"github.com/octohelm/storage/pkg/dal"
)

func NewAccessTokenRepository(a *account.Account) *AccessTokenRepository {
	return &AccessTokenRepository{
		Account: a,
	}
}

type AccessTokenRepository struct {
	Account *account.Account
}

func (repo *AccessTokenRepository) AccountID() account.ID {
	return repo.Account.AccountID
}

func (repo *AccessTokenRepository) Record(ctx context.Context, id datatypes.SFID, desc string, expiresAt time.Time) error {
	a := &account.AccessToken{}
	a.ID = id
	a.Desc = desc
	a.ExpiresAt = datatypes.Timestamp(expiresAt)
	a.AccountID = repo.Account.AccountID

	err := dal.Prepare(a).Save(ctx)
	if err != nil {
		return err
	}
	return nil
}

func (repo *AccessTokenRepository) List(ctx context.Context, pager *datatypes.Pager) ([]account.AccessToken, error) {
	list := make([]account.AccessToken, 0)

	if pager == nil {
		pager = &datatypes.Pager{}
	}
	pager.SetDefaults()

	err := dal.From(account.AccessTokenT).
		Where(b.And(
			account.AccessTokenT.AccountID.V(b.Eq(repo.AccountID())),
			b.Or(
				account.AccessTokenT.ExpiresAt.V(b.Gt(datatypes.Timestamp(time.Now()))),
				account.AccessTokenT.ExpiresAt.V(b.Eq(datatypes.TimestampZero)),
			),
		)).
		Scan(&list).
		OrderBy(b.DescOrder(account.AccessTokenT.ID)).
		Find(ctx)
	if err != nil {
		return nil, err
	}

	return list, nil
}
