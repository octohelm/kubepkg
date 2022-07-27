package user

import (
	"context"

	accountrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/account/repository"

	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"

	"github.com/octohelm/courier/pkg/courierhttp"
)

type CurrentUser struct {
	courierhttp.MethodGet
}

func (*CurrentUser) Output(ctx context.Context) (any, error) {
	a := authoperator.AccountContext.From(ctx)

	user, err := accountrepository.NewAccountRepository().GetUser(ctx, a.AccountID)
	if err != nil {
		return nil, err
	}

	a.User = *user

	return a, nil
}
