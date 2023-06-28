package main

import (
	kubeutilclient "github.com/octohelm/kubepkg/pkg/kubeutil/client"

	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/innoai-tech/infra/pkg/otel"
	"github.com/octohelm/kubepkg/internal/agent"
)

func init() {
	cli.AddTo(Serve, &Agent{})
}

// Serve kubepkg agent
type Agent struct {
	cli.C `component:"kubepkg-agent"`
	otel.Otel
	Metric otel.Metric

	kubeutilclient.KubeClient
	agent.Server
}
