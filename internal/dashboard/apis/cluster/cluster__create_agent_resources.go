package cluster

import (
	"context"

	"github.com/octohelm/courier/pkg/courierhttp"
	clusterrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/repository"
	clusterservice "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/service"
)

type CreateClusterAgentResources struct {
	courierhttp.MethodPost `path:"/clusters/:name/agent/resources"`
	Name                   string `name:"name" in:"path"`
}

func (p *CreateClusterAgentResources) Output(ctx context.Context) (any, error) {
	c, err := clusterrepository.NewClusterRepository().Get(ctx, p.Name)
	if err != nil {
		return nil, err
	}
	return clusterservice.NewClusterService(c).CreateResources(ctx)
}
