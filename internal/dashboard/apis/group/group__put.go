package group

import (
	"context"

	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/expression"
	"github.com/octohelm/kubepkg/pkg/rbac"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
)

func (PutGroup) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		rbac.Need(expression.AnyOf(
			authoperator.NeedAdminRole(group.ROLE_TYPE__MEMBER),
			authoperator.NeedGroupRole(group.ROLE_TYPE__OWNER),
		)),
	}
}

type PutGroup struct {
	courierhttp.MethodPut `path:"/groups/:groupName"`
	GroupName             string     `name:"groupName" in:"path"`
	Info                  group.Info `in:"body"`
}

func (p *PutGroup) Output(ctx context.Context) (any, error) {
	return grouprepository.NewGroupRepository().Put(ctx, p.GroupName, p.Info)
}
