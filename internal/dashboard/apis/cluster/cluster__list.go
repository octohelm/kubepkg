package cluster

import (
	"context"

	"github.com/octohelm/courier/pkg/courierhttp"
	clusterrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/repository"
)

type ListCluster struct {
	courierhttp.MethodGet `path:"/clusters"`
}

func (p *ListCluster) Output(ctx context.Context) (any, error) {
	return clusterrepository.NewClusterRepository().List(ctx, nil)
}
