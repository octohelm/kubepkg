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
	groupservice "github.com/octohelm/kubepkg/internal/dashboard/domain/group/service"
)

func (DeleteGroupEnvDeployment) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroupEnv{},

		rbac.Need(expression.AnyOf(
			authoperator.NeedGroupRole(group.ROLE_TYPE__OWNER),
		)),
	}
}

type DeleteGroupEnvDeployment struct {
	courierhttp.MethodDelete `path:"/deployments/:deploymentName"`
	DeploymentName           string `name:"deploymentName" in:"path"`
}

func (p *DeleteGroupEnvDeployment) Output(ctx context.Context) (any, error) {
	ge := operator.GroupEnvContext.From(ctx)
	ges := groupservice.NewGroupEnvDeploymentService(ge.Group, &ge.Env)

	return nil, ges.Delete(ctx, p.DeploymentName)
}
