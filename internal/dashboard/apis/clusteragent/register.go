package clusteragent

import (
	"context"

	"github.com/octohelm/courier/pkg/courierhttp"
	clusterrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/repository"
	clusterservice "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/service"
	"github.com/octohelm/kubepkg/pkg/agent"
)

type RegisterClusterAgent struct {
	courierhttp.MethodPut `path:"/clusteragent/register"`
	Data                  agent.Agent `in:"body"`
}

func (p *RegisterClusterAgent) EndpointRole() string {
	return agent.ENDPOINT_ROLE
}

func (p *RegisterClusterAgent) Output(ctx context.Context) (any, error) {
	c, err := clusterrepository.NewClusterRepository().Get(ctx, p.Data.Name)
	if err != nil {
		return nil, err
	}
	return nil, clusterservice.NewClusterService(c).Register(ctx, &p.Data)
}
