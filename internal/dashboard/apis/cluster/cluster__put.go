package cluster

import (
	"context"

	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	"github.com/octohelm/kubepkg/pkg/rbac"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/cluster"

	"github.com/octohelm/courier/pkg/courierhttp"
	clusterrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/repository"
)

func (PutCluster) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		rbac.Need(
			authoperator.NeedAdminRole(group.ROLE_TYPE__MEMBER),
		),
	}
}

type PutCluster struct {
	courierhttp.MethodPut `path:"/clusters/:name"`
	Name                  string       `name:"name" in:"path"`
	Info                  cluster.Info `in:"body"`
}

func (p *PutCluster) Output(ctx context.Context) (any, error) {
	return clusterrepository.NewClusterRepository().PutInfo(ctx, p.Name, p.Info)
}
