package admin

import (
	"context"

	accountrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/account/repository"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"

	"github.com/octohelm/courier/pkg/courierhttp"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
)

type ListAdminAccount struct {
	courierhttp.MethodGet `path:"/admin/accounts"`
	group.UserQueryParams
}

func (p *ListAdminAccount) Output(ctx context.Context) (any, error) {
	adminGroupAccount := grouprepository.NewGroupAccountRepository(grouprepository.AdminGroup())

	return adminGroupAccount.ListAccountUser(
		ctx,
		p.UserQueryParams,
		accountrepository.NewAccountRepository().RangeIdentity,
	)
}
