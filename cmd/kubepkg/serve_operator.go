package main

import (
	"github.com/innoai-tech/infra/pkg/otel"
	"github.com/octohelm/kubepkg/pkg/kubepkg/controller"

	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
)

func init() {
	cli.AddTo(Serve, &Operator{})
}

// Serve Operator
type Operator struct {
	cli.C `component:"kubepkg-operator"`
	otel.Otel
	kubeutil.KubeClient
	controller.Operator
}
