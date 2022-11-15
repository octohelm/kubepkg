package admin

import (
	"context"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"
	accountrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/account/repository"
)

type ListAccount struct {
	courierhttp.MethodGet `path:"/accounts"`
	account.UserQueryParams
}

func (p *ListAccount) Output(ctx context.Context) (any, error) {
	return accountrepository.NewAccountRepository().ListUserAccount(ctx, p.UserQueryParams)
}
