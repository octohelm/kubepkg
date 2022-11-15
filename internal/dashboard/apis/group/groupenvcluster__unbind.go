package group

import (
	"context"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/cluster"

	"github.com/octohelm/courier/pkg/expression"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
	"github.com/octohelm/kubepkg/pkg/rbac"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
)

func (UnbindGroupEnvCluster) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroupEnv{},
		rbac.Need(expression.AnyOf(
			authoperator.NeedGroupRole(group.ROLE_TYPE__OWNER),
		)),
	}
}

type UnbindGroupEnvCluster struct {
	courierhttp.MethodDelete `path:"/clusters/:clusterID"`
	ClusterID                cluster.ID `name:"clusterID" in:"path"`
}

func (p *UnbindGroupEnvCluster) Output(ctx context.Context) (any, error) {
	gec := operator.GroupEnvContext.From(ctx)
	ger := grouprepository.NewGroupEnvRepository(gec.Group)
	return ger.BindCluster(ctx, gec.EnvName, 0)
}
