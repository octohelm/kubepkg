package main

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"path/filepath"

	"sigs.k8s.io/yaml"

	"github.com/go-courier/logr"
	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/innoai-tech/infra/pkg/otel"
	clientagent "github.com/octohelm/kubepkg/internal/agent/client/agent"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/containerregistry"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	"github.com/pkg/errors"
)

func init() {
	cli.AddTo(App, &Import{})
}

// import kubepkg.tgz or kubepkg.{json,yaml}
type Import struct {
	cli.C
	otel.Otel
	Importer
}

type Importer struct {
	KubepkgSpecOrTgz []string `arg:""`

	// Import to. REMOTE_AGENT (http://ip:port) or STORAGE_ROOT (dir path)
	ImportTo string `flag:",omitempty" `
	// Only for importing to REMOTE_AGENT
	Incremental bool `flag:",omitempty"`
	// Only for importing to REMOTE_AGENT without blobs, when --incremental set
	SkipBlobs bool `flag:",omitempty"`
	// Dir to output manifest. Only for importing to STORAGE_ROOT
	ManifestOutput string `flag:",omitempty"`
}

func (s *Importer) Run(ctx context.Context) error {
	u, err := url.Parse(s.ImportTo)
	if err != nil {
		return err
	}
	if u.Scheme == "" {
		return s.importToStorageRoot(ctx, s.ImportTo, s.KubepkgSpecOrTgz)
	}
	return s.importToRemote(ctx, fmt.Sprintf("%s://%s", u.Scheme, u.Host), s.KubepkgSpecOrTgz)
}

func (s *Importer) importToStorageRoot(ctx context.Context, root string, tgzFilenames []string) error {
	l := logr.FromContext(ctx)

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

		l.Info("blobs of %s@%s is imported.", kpkg.Name, kpkg.Spec.Version)

		if s.ManifestOutput != "" {
			f := filepath.Join(s.ManifestOutput, fmt.Sprintf("%s.%s.kubepkg.yaml", kpkg.Name, kpkg.Namespace))
			data, _ := yaml.Marshal(kpkg)
			if err := os.WriteFile(f, data, os.ModePerm); err != nil {
				return err
			}
			l.Info("%s is writen.", f)
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

func (s *Importer) importToRemote(ctx context.Context, kubeAgentEndpoint string, filenames []string) error {
	l := logr.FromContext(ctx)

	ac := &clientagent.Client{
		Endpoint: kubeAgentEndpoint,
	}
	if err := ac.Init(ctx); err != nil {
		return err
	}

	ctx = ac.InjectContext(ctx)

	importSpec := func(jsonOrYamlFile string) error {
		specFileRaw, err := os.ReadFile(jsonOrYamlFile)
		if err != nil {
			return err
		}

		kp := &v1alpha1.KubePkg{}
		if err := yaml.Unmarshal(specFileRaw, kp); err != nil {
			return errors.Wrapf(err, "unmarshal %s failed", jsonOrYamlFile)
		}

		kpkg, err := clientagent.ImportKubePkg(ctx, kp)
		if err != nil {
			return err
		}

		l.Info("%s@%s is imported.", kpkg.Name, kpkg.Spec.Version)
		return nil
	}

	importTgz := func(tgzFilename string) error {
		tgzFile, err := os.Open(tgzFilename)
		if err != nil {
			return err
		}

		kpkg, err := clientagent.ImportKubePkgTgz(ctx, tgzFile, s.Incremental, s.SkipBlobs)
		if err != nil {
			return err
		}

		l.Info("%s@%s is imported.", kpkg.Name, kpkg.Spec.Version)
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
