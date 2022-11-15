package group

import (
	"context"

	"github.com/octohelm/courier/pkg/expression"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
	"github.com/octohelm/kubepkg/pkg/rbac"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
)

func (PutGroupEnv) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroup{},
		rbac.Need(expression.AnyOf(
			authoperator.NeedGroupRole(group.ROLE_TYPE__OWNER),
		)),
	}
}

type PutGroupEnv struct {
	courierhttp.MethodPut `path:"/envs/:envName"`
	EnvName               string        `name:"envName" in:"path"`
	Info                  group.EnvInfo ` in:"body"`
}

func (p *PutGroupEnv) Output(ctx context.Context) (any, error) {
	return grouprepository.NewGroupEnvRepository(operator.GroupContext.From(ctx)).Put(ctx, p.EnvName, p.Info)
}
