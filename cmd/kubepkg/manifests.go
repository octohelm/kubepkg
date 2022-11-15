package main

import (
	"context"
	"fmt"

	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	"github.com/octohelm/kubepkg/pkg/kubepkg/manifest"
	"sigs.k8s.io/yaml"
)

func init() {
	cli.AddTo(App, &Manifests{})
}

// Show manifests
type Manifests struct {
	cli.C
	PrintManifests
}

type PrintManifests struct {
	Namespace   string `flag:",omitempty"`
	KubepkgJSON string `arg:""`
}

func (p *PrintManifests) Run(ctx context.Context) error {
	kpkg, err := kubepkg.Load(p.KubepkgJSON)
	if err != nil {
		return err
	}

	if p.Namespace != "" {
		kpkg.Namespace = p.Namespace
	}

	manifests, err := manifest.ExtractComplete(kpkg)
	if err != nil {
		return err
	}

	for _, m := range manifests {
		fmt.Println("---")
		data, _ := yaml.Marshal(m)
		fmt.Println(string(data))
	}

	return nil
}
