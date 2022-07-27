package main

import (
	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/innoai-tech/infra/pkg/otel"
	"github.com/octohelm/kubepkg/pkg/kubepkg/k8sapply"
)

func init() {
	cli.AddTo(App, &Apply{})
}

// Apply manifests to k8s directly
type Apply struct {
	cli.C
	otel.Otel
	k8sapply.Apply
}
