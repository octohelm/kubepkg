package cmd

import (
	"context"
	"fmt"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/pkg/errors"
	"net/url"
	"os"
	"path/filepath"

	"github.com/go-logr/logr"
	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/containerregistry"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	"github.com/octohelm/kubepkg/pkg/kubepkg/agent/client"
	"sigs.k8s.io/yaml"
)

func init() {
	cli.Add(app, &Import{})
}

type ImportFlags struct {
	ImportTo       string `flag:"import-to,i" desc:"Import to. REMOTE_AGENT (http://ip:port) or STORAGE_ROOT (dir path)"`
	Incremental    bool   `flag:"incremental" desc:"Only for importing to REMOTE_AGENT"`
	SkipBlobs      bool   `flag:"skip-blobs" desc:"Only for importing to REMOTE_AGENT without blobs, when --incremental set"`
	ManifestOutput string `flag:"manifest-output" desc:"Dir to output manifest. Only for importing to STORAGE_ROOT"`
}

type Import struct {
	cli.Name `args:"KUBEPKG_TGZ|KUBEPKG_SPEC..." desc:"import kubepkg.tgz or kubepkg.{json,yaml}"`
	ImportFlags
	VerboseFlags
}

func (s *Import) Run(ctx context.Context) error {
	u, err := url.Parse(s.ImportTo)
	if err != nil {
		return err
	}

	if u.Scheme == "" {
		return s.importToStorageRoot(ctx, s.ImportTo, s.Args)
	}

	return s.importToRemote(ctx, fmt.Sprintf("%s://%s", u.Scheme, u.Host), s.Args)
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

func (s *Import) importToRemote(ctx context.Context, kubeAgentEndpoint string, filenames []string) error {
	l := logr.FromContextOrDiscard(ctx)

	ac := client.NewAgentClient(kubeAgentEndpoint)

	importSpec := func(jsonOrYamlFile string) error {
		specFileRaw, err := os.ReadFile(jsonOrYamlFile)
		if err != nil {
			return err
		}

		kp := &v1alpha1.KubePkg{}
		if err := yaml.Unmarshal(specFileRaw, kp); err != nil {
			return errors.Wrapf(err, "unmarshal %s failed", jsonOrYamlFile)
		}

		kpkg, err := ac.ImportKubePkg(ctx, kp)
		if err != nil {
			return err
		}

		l.Info(fmt.Sprintf("%s@%s is imported.", kpkg.Name, kpkg.Spec.Version))

		return nil
	}

	importTgz := func(tgzFilename string) error {
		tgzFile, err := os.Open(tgzFilename)
		if err != nil {
			return err
		}
		defer tgzFile.Close()

		if s.Incremental {
			kpkg, err := client.IncrementalImport(ctx, ac, tgzFile, s.SkipBlobs)
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

		l.Info(fmt.Sprintf("%s@%s is imported.", kpkg.Name, kpkg.Spec.Version))

		return nil
	}

	for i := range filenames {
		filename := filenames[i]
		switch filepath.Ext(filename) {
		case ".json", ".yaml":
			if err := importSpec(filename); err != nil {
				return err
			}
		default:
			if err := importTgz(filename); err != nil {
				return err
			}
		}
	}

	return nil
}
