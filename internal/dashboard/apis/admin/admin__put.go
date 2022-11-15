package admin

import (
	"context"

	"github.com/octohelm/courier/pkg/courier"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
	"github.com/octohelm/kubepkg/pkg/rbac"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"

	"github.com/octohelm/courier/pkg/courierhttp"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
)

func (PutAdminAccount) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		rbac.Need(
			authoperator.NeedAdminRole(group.ROLE_TYPE__MEMBER),
		),
	}
}

type PutAdminAccount struct {
	courierhttp.MethodPut `path:"/admin/accounts/:accountID"`
	AccountID             account.ID `name:"accountID" in:"path"`
	group.RoleInfo        `in:"body"`
}

func (p *PutAdminAccount) Output(ctx context.Context) (any, error) {
	adminGroupAccount := grouprepository.NewGroupAccountRepository(grouprepository.AdminGroup())

	return adminGroupAccount.Put(
		ctx,
		p.RoleType,
		p.AccountID,
	)
}
