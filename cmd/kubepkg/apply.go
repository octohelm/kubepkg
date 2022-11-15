package main

import (
	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/kubepkg/k8sapply"
	"github.com/octohelm/kubepkg/pkg/logutil"
)

func init() {
	cli.AddTo(App, &Apply{})
}

// Apply manifests to k8s directly
type Apply struct {
	cli.C
	logutil.Logger
	k8sapply.Apply
}
