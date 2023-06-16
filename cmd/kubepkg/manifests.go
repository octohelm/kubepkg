package main

import (
	"context"

	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
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
	Output      string `flag:",omitempty"`
	KubepkgJSON string `arg:""`
}

func (p *PrintManifests) Run(ctx context.Context) error {
	kpkgs, err := kubepkg.Load(p.KubepkgJSON)
	if err != nil {
		return err
	}

	for i := range kpkgs {
		kpkg := kpkgs[i]

		if p.Namespace != "" {
			kpkg.Namespace = p.Namespace
		}
	}

	d := ManifestDumper{
		ExtractManifestsYaml: "-",
	}

	if p.Output != "" {
		d.ExtractManifestsYaml = p.Output
	}

	return d.DumpManifests(kpkgs)
}
