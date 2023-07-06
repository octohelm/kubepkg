package clusterinfo

import (
	"context"
	"fmt"

	"github.com/octohelm/kubepkg/pkg/kubeutil/client"
	contextx "github.com/octohelm/x/context"
	corev1 "k8s.io/api/core/v1"
)

type Provider struct {
	info *ClusterInfo
}

func (n *Provider) Init(ctx context.Context) error {
	c := client.ClientFromContext(ctx)

	nodeList := &corev1.NodeList{}

	if err := c.List(ctx, nodeList); err != nil {
		return err
	}

	info := &ClusterInfo{}

	for _, node := range nodeList.Items {
		n := &ClusterNode{
			Role:           "agent",
			NodeSystemInfo: node.Status.NodeInfo,
		}

		for _, addr := range node.Status.Addresses {
			switch addr.Type {
			case corev1.NodeHostName:
				n.Hostname = addr.Address
			case corev1.NodeExternalIP:
				n.ExternalIP = addr.Address
			case corev1.NodeInternalIP:
				n.InternalIP = addr.Address
			}
		}

		if node.Labels != nil {
			if v, ok := node.Labels["node-role.kubernetes.io/control-plane"]; ok {
				if v == "true" {
					n.Role = "control-plane"
				}
			}
		}

		info.Nodes = append(info.Nodes, n)

		for _, img := range node.Status.Images {
			info.Images = append(info.Images, img.Names[len(img.Names)-1])
		}
	}

	n.info = info

	return nil
}

func (n *Provider) InjectContext(ctx context.Context) context.Context {
	return ContextWithClusterInfo(ctx, n.info)
}

type ClusterInfo struct {
	Nodes  []*ClusterNode `json:"nodes"`
	Images []string       `json:"-"`
}

func (v ClusterInfo) SupportedPlatforms() []string {
	platforms := make([]string, 0)
	records := map[string]bool{}

	for _, n := range v.Nodes {
		platform := fmt.Sprintf("%s/%s", n.OperatingSystem, n.Architecture)

		if _, ok := records[platform]; !ok {
			platforms = append(platforms, platform)
			records[platform] = true
		}
	}

	return platforms
}

type ClusterNode struct {
	corev1.NodeSystemInfo

	Role       string `json:"role"`
	Hostname   string `json:"hostname"`
	InternalIP string `json:"internalIP"`
	ExternalIP string `json:"externalIP"`
}

type clusterInfoContext struct {
}

func FromContext(ctx context.Context) *ClusterInfo {
	return ctx.Value(clusterInfoContext{}).(*ClusterInfo)
}

func ContextWithClusterInfo(ctx context.Context, n *ClusterInfo) context.Context {
	return contextx.WithValue(ctx, clusterInfoContext{}, n)
}
