package service

import (
	"context"
	"time"

	agentclient "github.com/octohelm/kubepkg/internal/agent/client/agent"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/cluster"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/strfmt"
)

func NewClusterService(c *cluster.Cluster) *ClusterService {
	return &ClusterService{
		c: c,
	}
}

type ClusterService struct {
	c *cluster.Cluster
}

func (c *ClusterService) injectContext(ctx context.Context) (context.Context, error) {
	a := &agentclient.Client{}
	a.Endpoint = c.c.Endpoint
	if err := a.Init(ctx); err != nil {
		return nil, err
	}
	return a.InjectContext(ctx), nil
}

func (c *ClusterService) Status(ctx context.Context) (*cluster.InstanceStatus, error) {
	newCtx, err := c.injectContext(ctx)
	if err != nil {
		return nil, err
	}

	started := time.Now()

	info, err := agentclient.AgentInfo(newCtx)
	if err != nil {
		return nil, err
	}

	return &cluster.InstanceStatus{
		ID:                 info.AgentID,
		SupportedPlatforms: info.SupportedPlatforms,
		Ping:               strfmt.Duration(time.Since(started)),
	}, nil

}

func (c *ClusterService) Deployments(ctx context.Context, namespace string) ([]v1alpha1.KubePkg, error) {
	newCtx, err := c.injectContext(ctx)
	if err != nil {
		return nil, err
	}
	list := &agentclient.ListKubePkg{}
	list.Namespace = namespace
	resp, _, err := list.Invoke(newCtx)
	if err != nil {
		return nil, err
	}
	return *resp, nil
}
