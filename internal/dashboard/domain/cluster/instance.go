package cluster

import "github.com/octohelm/kubepkg/pkg/strfmt"

type InstanceStatus struct {
	ID                 string          `json:"id"`
	Ping               strfmt.Duration `json:"ping"`
	SupportedPlatforms []string        `json:"supportedPlatforms"`
}
