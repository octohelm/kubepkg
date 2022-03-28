package cmd

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/go-logr/logr"
	"github.com/octohelm/kubepkg/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/containerregistry"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	"sigs.k8s.io/yaml"
)

func init() {
	app.Add(&Import{})
}

type ImportFlags struct {
	Storage
	ManifestOutput string `flag:"manifest-output,o" desc:"output manifest"`
}

type Import struct {
	cli.Name `args:"KUBEPKG_TGZ..." desc:"import kubepkg.tgz"`
	ImportFlags
}

func (s *Import) Run(ctx context.Context, args []string) error {
	l := logr.FromContextOrDiscard(ctx)
	ctx = containerregistry.WithLogger(ctx, l)

	c := containerregistry.Configuration{}

	c.StorageRoot = s.Storage.Root

	cr, err := c.New(ctx)
	if err != nil {
		return err
	}

	r := kubepkg.NewRegistry(cr, c.MustStorage())

	for i := range args {
		tgzFilename := args[i]

		tgzFile, err := os.Open(tgzFilename)
		if err != nil {
			return err
		}

		kpkg, err := r.ImportFromKubeTgzReader(ctx, tgzFile)
		if err != nil {
			return err
		}

		l.Info(fmt.Sprintf("blobs of %s@%s is imported.", kpkg.Name, kpkg.Spec.Version))

		if s.ManifestOutput != "" {
			f := filepath.Join(s.ManifestOutput, fmt.Sprintf("%s.%s.kubepkg.yaml", kpkg.Name, kpkg.Namespace))
			data, _ := yaml.Marshal(kpkg)
			if err := os.WriteFile(f, data, os.ModePerm); err != nil {
				return err
			}
			l.Info(fmt.Sprintf("%s is writen.", f))
		}

	}

	return nil
}
