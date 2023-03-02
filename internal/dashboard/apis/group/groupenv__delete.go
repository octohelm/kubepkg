package group

import (
	"context"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/courier/pkg/expression"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
	"github.com/octohelm/kubepkg/pkg/rbac"
)

func (DeleteGroupEnv) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroup{},
		rbac.Need(expression.AnyOf(
			authoperator.NeedGroupRole(group.ROLE_TYPE__OWNER),
		)),
	}
}

type DeleteGroupEnv struct {
	courierhttp.MethodDelete `path:"/envs/:envName"`
	EnvName                  string `name:"envName" in:"path"`
}

func (p *DeleteGroupEnv) Output(ctx context.Context) (any, error) {
	return nil, grouprepository.NewGroupEnvRepository(operator.GroupContext.From(ctx)).Delete(ctx, p.EnvName)
}
