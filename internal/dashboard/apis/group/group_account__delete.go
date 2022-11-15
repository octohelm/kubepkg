package group

import (
	"context"

	"github.com/octohelm/courier/pkg/expression"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	"github.com/octohelm/kubepkg/pkg/rbac"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
)

func (DeleteGroupAccount) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroup{},
		rbac.Need(expression.AnyOf(
			authoperator.NeedAdminRole(group.ROLE_TYPE__MEMBER),
			authoperator.NeedGroupRole(group.ROLE_TYPE__OWNER),
		)),
	}
}

type DeleteGroupAccount struct {
	courierhttp.MethodDelete `path:"/accounts/:accountID"`
	AccountID                account.ID `name:"accountID" in:"path"`
}

func (p *DeleteGroupAccount) Output(ctx context.Context) (any, error) {
	adminGroupAccount := grouprepository.NewGroupAccountRepository(operator.GroupContext.From(ctx))
	return nil, adminGroupAccount.Delete(ctx, p.AccountID)
}
