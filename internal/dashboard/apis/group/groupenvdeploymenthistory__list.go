package group

import (
	"context"

	"github.com/octohelm/courier/pkg/expression"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	"github.com/octohelm/kubepkg/pkg/rbac"

	groupservice "github.com/octohelm/kubepkg/internal/dashboard/domain/group/service"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"
	"github.com/octohelm/kubepkg/pkg/datatypes"
)

func (ListGroupEnvDeploymentHistory) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroupEnv{},

		rbac.Need(expression.AnyOf(
			authoperator.NeedGroupRole(group.ROLE_TYPE__MEMBER),
		)),
	}
}

type ListGroupEnvDeploymentHistory struct {
	courierhttp.MethodGet `path:"/deployments/:deploymentID/histories"`
	DeploymentID          group.DeploymentID `in:"path" name:"deploymentID"`
	datatypes.Pager
}

func (r *ListGroupEnvDeploymentHistory) Output(ctx context.Context) (any, error) {
	groupEnv := operator.GroupEnvContext.From(ctx)
	s := groupservice.NewGroupEnvDeploymentService(groupEnv.Group, &groupEnv.Env)

	return s.ListKubePkgHistory(ctx, r.DeploymentID, &r.Pager)
}
