package main

import (
	"github.com/innoai-tech/infra/pkg/otel"
	"github.com/octohelm/kubepkg/pkg/kubepkg/controller"
	kubeutilclient "github.com/octohelm/kubepkg/pkg/kubeutil/client"

	"github.com/innoai-tech/infra/pkg/cli"
)

func init() {
	cli.AddTo(Serve, &Operator{})
}

// Serve Operator
type Operator struct {
	cli.C `component:"kubepkg-operator"`
	otel.Otel
	kubeutilclient.KubeClient
	controller.Operator
}
