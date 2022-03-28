package cmd

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"path/filepath"

	"github.com/go-logr/logr"
	"github.com/octohelm/kubepkg/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/containerregistry"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	"github.com/octohelm/kubepkg/pkg/kubepkg/agent/client"
	"sigs.k8s.io/yaml"
)

func init() {
	app.Add(&Import{})
}

type ImportFlags struct {
	ImportTo       string `flag:"import-to,i" desc:"Import to. REMOTE_AGENT (http://ip:port) or STORAGE_ROOT (dir path)"`
	Incremental    bool   `flag:"incremental" desc:"Only for importing to REMOTE_AGENT"`
	ManifestOutput string `flag:"manifest-output" desc:"Dir to output manifest. Only for importing to STORAGE_ROOT"`
}

type Import struct {
	cli.Name `args:"KUBEPKG_TGZ..." desc:"import kubepkg.tgz"`
	ImportFlags
	VerboseFlags
}

func (s *Import) Run(ctx context.Context, args []string) error {
	u, err := url.Parse(s.ImportTo)
	if err != nil {
		return err
	}

	if u.Scheme == "" {
		return s.importToStorageRoot(ctx, s.ImportTo, args)
	}

	return s.importToRemote(ctx, fmt.Sprintf("%s://%s", u.Scheme, u.Host), args)
}

func (s *Import) importToStorageRoot(ctx context.Context, root string, tgzFilenames []string) error {
	l := logr.FromContextOrDiscard(ctx)

	c := containerregistry.Configuration{}
	c.StorageRoot = root

	cr, err := c.New(ctx)
	if err != nil {
		return err
	}

	r := kubepkg.NewRegistry(cr, c.MustStorage())

	importTgz := func(tgzFilename string) error {
		tgzFile, err := os.Open(tgzFilename)
		if err != nil {
			return err
		}
		defer tgzFile.Close()

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

		return nil
	}

	for i := range tgzFilenames {
		if err := importTgz(tgzFilenames[i]); err != nil {
			return err
		}
	}

	return nil
}

func (s *Import) importToRemote(ctx context.Context, kubeAgentEndpoint string, tgzFilenames []string) error {
	l := logr.FromContextOrDiscard(ctx)

	ac := client.NewAgentClient(kubeAgentEndpoint)

	importTgz := func(tgzFilename string) error {
		tgzFile, err := os.Open(tgzFilename)
		if err != nil {
			return err
		}
		defer tgzFile.Close()

		if s.Incremental {
			kpkg, err := client.IncrementalImport(ctx, ac, tgzFile)
			if err != nil {
				return err

			}
			l.Info(fmt.Sprintf("%s@%s.tgz is imported.", kpkg.Name, kpkg.Spec.Version))
			return nil
		}

		kpkg, err := ac.ImportKubePkgTgz(ctx, tgzFile)
		if err != nil {
			return err
		}

		l.Info(fmt.Sprintf("%s@%s.tgz is imported.", kpkg.Name, kpkg.Spec.Version))

		return nil
	}

	for i := range tgzFilenames {
		if err := importTgz(tgzFilenames[i]); err != nil {
			return err
		}
	}

	return nil
}
