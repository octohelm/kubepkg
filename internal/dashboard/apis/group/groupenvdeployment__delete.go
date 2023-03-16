package group

import (
	"context"

	"github.com/go-courier/logr"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/courier/pkg/expression"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"
	clusterservice "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/service"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	groupservice "github.com/octohelm/kubepkg/internal/dashboard/domain/group/service"
	"github.com/octohelm/kubepkg/pkg/rbac"
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

	if ge.Cluster != nil && ge.Cluster.Endpoint != "" && ge.Namespace != "" {
		if err := clusterservice.NewClusterService(ge.Cluster).Delete(ctx, ge.Namespace, p.DeploymentName); err != nil {
			logr.FromContext(ctx).Error(err)
		}
	}

	return nil, ges.Delete(ctx, p.DeploymentName)
}
