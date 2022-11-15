package service

import (
	"context"
	"time"

	"github.com/octohelm/kubepkg/pkg/strfmt"

	agentclient "github.com/octohelm/kubepkg/internal/agent/client/agent"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/cluster"
)

func NewClusterService(c *cluster.Cluster) *ClusterService {
	return &ClusterService{
		c: c,
	}
}

type ClusterService struct {
	c *cluster.Cluster
}

func (c *ClusterService) Status(ctx context.Context) (*cluster.InstanceStatus, error) {
	if c.c.Endpoint == "" {
		return &cluster.InstanceStatus{}, nil
	}

	a := &agentclient.Client{}
	a.Endpoint = c.c.Endpoint
	if err := a.Init(ctx); err != nil {
		return nil, err
	}

	started := time.Now()

	info, err := agentclient.AgentInfo(a.InjectContext(ctx))
	if err != nil {
		return nil, err
	}

	return &cluster.InstanceStatus{
		ID:                 info.AgentID,
		SupportedPlatforms: info.SupportedPlatforms,
		Ping:               strfmt.Duration(time.Since(started)),
	}, nil

}
