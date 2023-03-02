package group

import (
	"context"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/courier/pkg/expression"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
	"github.com/octohelm/kubepkg/pkg/rbac"
)

func (DeleteGroup) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		rbac.Need(expression.AnyOf(
			authoperator.NeedAdminRole(group.ROLE_TYPE__MEMBER),
			authoperator.NeedGroupRole(group.ROLE_TYPE__OWNER),
		)),
	}
}

type DeleteGroup struct {
	courierhttp.MethodDelete `path:"/groups/:groupName"`
	GroupName                string `name:"groupName" in:"path"`
}

func (p *DeleteGroup) Output(ctx context.Context) (any, error) {
	return nil, grouprepository.NewGroupRepository().Delete(ctx, p.GroupName)
}
