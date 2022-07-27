package admin

import (
	"context"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
)

type DeleteAdminAccount struct {
	courierhttp.MethodDelete `path:"/admin/accounts/:accountID"`
	AccountID                account.ID `name:"accountID" in:"path"`
}

func (p *DeleteAdminAccount) Output(ctx context.Context) (any, error) {
	adminGroupAccount := grouprepository.NewGroupAccountRepository(grouprepository.AdminGroup())

	return nil, adminGroupAccount.Delete(
		ctx,
		p.AccountID,
	)
}
