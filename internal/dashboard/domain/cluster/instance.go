package cluster

import (
	"github.com/octohelm/kubepkg/pkg/kubeutil/clusterinfo"
	"github.com/octohelm/kubepkg/pkg/strfmt"
)

type InstanceStatus struct {
	clusterinfo.ClusterInfo
	Ping strfmt.Duration `json:"ping,omitempty"`
}
