package service

import (
	"context"
	"time"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/account/repository"
	"github.com/octohelm/kubepkg/pkg/datatypes"
	"github.com/octohelm/kubepkg/pkg/signer"
)

func NewAccessTokenService(a *account.Account) *AccessTokenService {
	return &AccessTokenService{
		repo: repository.NewAccessTokenRepository(a),
	}
}

type AccessTokenService struct {
	repo *repository.AccessTokenRepository
}

func (svc *AccessTokenService) Sign(ctx context.Context, desc string, expiresIn time.Duration) (string, error) {
	s := signer.FromContext(ctx)

	token, id, err := s.Sign(ctx, expiresIn, "access", svc.repo.AccountID().String(), svc.repo.Account.AccountType.String())
	if err != nil {
		return "", err
	}

	if err := svc.repo.Record(ctx, datatypes.SFID(id), desc, time.Now().Add(expiresIn)); err != nil {
		return "", err
	}

	return token, nil
}
