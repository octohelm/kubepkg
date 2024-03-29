package service

import (
	"context"
	"time"

	"github.com/octohelm/kubepkg/pkg/agent"

	"github.com/octohelm/kubepkg/pkg/kubepkg/specutil"

	agentclient "github.com/octohelm/kubepkg/internal/agent/client/agent"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/cluster"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/strfmt"
)

func NewClusterService(c *cluster.Cluster) *ClusterService {
	return &ClusterService{
		c: c,
		a: agent.NewRegister(),
	}
}

type ClusterService struct {
	c *cluster.Cluster
	a agent.Registry
}

func (c *ClusterService) injectContext(ctx context.Context) (context.Context, error) {
	a := &agentclient.Client{}
	a.Endpoint = c.c.AgentInfo.Endpoint
	a.OtpKeyURL = c.c.AgentSecureInfo.OtpKeyURL

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
		Ping: strfmt.Duration(time.Since(started)),

		ClusterInfo: *info,
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

func (c *ClusterService) Apply(ctx context.Context, kpkg *v1alpha1.KubePkg) error {
	newCtx, err := c.injectContext(ctx)
	if err != nil {
		return err
	}
	apply := &agentclient.ApplyKubePkg{}

	if kpkgMerged, err := specutil.ApplyOverwrites(kpkg); err == nil {
		apply.ApisKubepkgV1Alpha1KubePkg = *kpkgMerged
	} else {
		return err
	}

	if _, err := apply.Invoke(newCtx); err != nil {
		return err
	}
	return nil
}

func (c *ClusterService) Delete(ctx context.Context, namespace string, name string) error {
	newCtx, err := c.injectContext(ctx)
	if err != nil {
		return err
	}
	del := &agentclient.DelKubePkg{}

	del.Namespace = namespace
	del.Name = name

	if _, err := del.Invoke(newCtx); err != nil {
		return err
	}
	return nil
}
