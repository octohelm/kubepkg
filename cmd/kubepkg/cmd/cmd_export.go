package cmd

import (
	"context"
	"fmt"
	"github.com/octohelm/kubepkg/pkg/kubepkg/manifest"
	"github.com/pkg/errors"
	"gopkg.in/yaml.v3"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"

	"github.com/go-logr/logr"
	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/containerregistry"
	"github.com/octohelm/kubepkg/pkg/ioutil"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
)

func init() {
	cli.Add(app, &Export{})
}

type ExportFlags struct {
	ForceResolve         bool     `flag:"force-resolve" desc:"ignore image locked sha256 digest"`
	Output               string   `flag:"output,o" desc:"output path for kubepkg.tgz"`
	ExtractManifestsYaml string   `flag:"extract-manifests-yaml" desc:"extract manifests as yaml"`
	Platforms            []string `flag:"platform" default:"linux/amd64,linux/arm64" desc:"supported platforms"`
	Storage
	RemoteRegistry
}

type Export struct {
	cli.Name `args:"KUBEPKG_MANIFEST" desc:"Create kubepkg.tgz from kubepkg manifest"`
	ExportFlags
	VerboseFlags
}

func (s *Export) Run(ctx context.Context) error {
	l := logr.FromContextOrDiscard(ctx)
	ctx = containerregistry.WithLogger(ctx, l)

	kpkg, err := kubepkg.Load(s.Args[0])
	if err != nil {
		return err
	}

	c := containerregistry.Configuration{}

	c.StorageRoot = s.Storage.Root
	c.Proxy = &containerregistry.Proxy{
		RemoteURL: s.Endpoint,
		Username:  s.Username,
		Password:  s.Password,
	}

	cr, err := c.New(ctx)
	if err != nil {
		return err
	}

	dr := kubepkg.NewDigestResolver(cr)
	p := kubepkg.NewPacker(cr)

	tgz, err := ioutil.CreateOrOpen(s.Output)
	if err != nil {
		return errors.Errorf("open output %s failed", s.Output)
	}
	defer tgz.Close()

	kubepkg.AnnotationPlatforms(kpkg, s.Platforms)

	if s.ForceResolve {
		for k := range kpkg.Spec.Images {
			kpkg.Spec.Images[k] = ""
		}
	}

	resolved, err := dr.Resolve(ctx, kpkg)
	if err != nil {
		return err
	}

	d, err := p.KubeTgzTo(ctx, resolved, tgz)
	if err != nil {
		return err
	}

	l.Info(
		fmt.Sprintf("%s generated.", s.Output),
		"digest", d,
	)

	if s.ExtractManifestsYaml != "" {
		manifestsYaml, err := ioutil.CreateOrOpen(s.ExtractManifestsYaml)
		if err != nil {
			return errors.Wrapf(err, "open %s failed", s.ExtractManifestsYaml)
		}
		defer manifestsYaml.Close()

		manifests, err := manifest.Extract(resolved.Spec.Manifests, func(o manifest.Object) (manifest.Object, error) {
			o.SetNamespace(resolved.GetNamespace())
			return o, nil
		})
		if err != nil {
			return errors.Wrapf(err, "extract manifests failed: %s", s.ExtractManifestsYaml)
		}

		w := yaml.NewEncoder(manifestsYaml)
		for _, m := range manifests {
			if u, ok := m.(*unstructured.Unstructured); ok {
				if err := w.Encode(u.Object); err != nil {
					return errors.Wrapf(err, "encoding to yaml failed: %s", s.ExtractManifestsYaml)
				}
			}
		}
		_ = w.Close()
	}

	return nil
}
