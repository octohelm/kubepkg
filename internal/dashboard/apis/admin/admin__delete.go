package admin

import (
	"context"

	"github.com/octohelm/courier/pkg/courier"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	"github.com/octohelm/kubepkg/pkg/rbac"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
)

func (DeleteAdminAccount) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		rbac.Need(
			authoperator.NeedAdminRole(group.ROLE_TYPE__OWNER),
		),
	}
}

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
