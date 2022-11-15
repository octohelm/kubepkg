package group

import (
	"context"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/cluster"
	clusterrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/repository"

	"github.com/octohelm/courier/pkg/expression"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
	"github.com/octohelm/kubepkg/pkg/rbac"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
)

func (GetGroupEnvClusterStatus) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroupEnv{},
		rbac.Need(expression.AnyOf(
			authoperator.NeedGroupRole(group.ROLE_TYPE__OWNER),
		)),
	}
}

type GetGroupEnvClusterStatus struct {
	courierhttp.MethodGet `path:"/clusters/:clusterID/status"`
	ClusterID             cluster.ID `name:"clusterID" in:"path"`
}

func (p *GetGroupEnvClusterStatus) Output(ctx context.Context) (any, error) {
	gec := operator.GroupEnvContext.From(ctx)

	if gec.ClusterID != 0 {
		c, err := clusterrepository.NewClusterRepository().Get(ctx, gec.ClusterID.String())
		if err != nil {
			return nil, err
		}
		if c.Endpoint != "" {
			return nil, err
		}
	}

	return nil, nil
}
