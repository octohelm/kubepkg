package cmd

import (
	"context"
	"fmt"
	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	"github.com/octohelm/kubepkg/pkg/kubepkg/manifest"
	"sigs.k8s.io/yaml"
)

func init() {
	cli.Add(app, &Manifests{})
}

type ManifestsFlags struct {
}

type Manifests struct {
	cli.Name `args:"KUBEPKG_JSON" desc:"show manifests"`
}

func (s *Manifests) Run(ctx context.Context) error {
	kpkg, err := kubepkg.Load(s.Args[0])
	if err != nil {
		return err
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
