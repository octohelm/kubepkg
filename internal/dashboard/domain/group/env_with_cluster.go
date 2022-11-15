package group

import "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster"

type EnvWithCluster struct {
	Env
	Cluster *cluster.Cluster `json:"cluster,omitempty"`
}
