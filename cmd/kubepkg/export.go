package main

import (
	"context"

	"sigs.k8s.io/yaml"

	"github.com/go-courier/logr"
	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/containerregistry"
	"github.com/octohelm/kubepkg/pkg/ioutil"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	"github.com/octohelm/kubepkg/pkg/kubepkg/manifest"
	"github.com/octohelm/kubepkg/pkg/logutil"
	"github.com/pkg/errors"
)

func init() {
	cli.AddTo(App, &Export{})
}

// BindKubepkg kubepkg.tgz from kubepkg manifest
type Export struct {
	cli.C
	logutil.Logger
	Exporter
}

type Exporter struct {
	KubepkgJSON string `arg:""`

	Storage        containerregistry.Storage
	RemoteRegistry containerregistry.RemoteRegistry

	// Ignore image locked sha256 digest
	ForceResolve bool `flag:",omitempty"`
	// Output path for kubepkg.tgz
	Output string
	// Extract manifests as yaml
	ExtractManifestsYaml string `flag:",omitempty"`
	// Supported platforms
	Platform []string `flag:",omitempty"`
}

func (s *Exporter) SetDefaults() {
	if s.Platform == nil {
		s.Platform = []string{
			"linux/amd64",
			"linux/arm64",
		}
	}
}

func (s *Exporter) Run(ctx context.Context) error {
	l := logr.FromContext(ctx)

	kpkg, err := kubepkg.Load(s.KubepkgJSON)
	if err != nil {
		return err
	}

	c := containerregistry.Configuration{}

	c.StorageRoot = s.Storage.Root
	c.Proxy = &containerregistry.Proxy{
		RemoteURL: s.RemoteRegistry.Endpoint,
		Username:  s.RemoteRegistry.Username,
		Password:  s.RemoteRegistry.Password,
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

	kubepkg.AnnotationPlatforms(kpkg, s.Platform)

	if s.ForceResolve {
		for k := range kpkg.Status.Images {
			kpkg.Status.Images[k] = ""
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

	l.WithValues("digest", d).Info(
		"%s generated.", s.Output,
	)

	if s.ExtractManifestsYaml != "" {
		manifestsYaml, err := ioutil.CreateOrOpen(s.ExtractManifestsYaml)
		if err != nil {
			return errors.Wrapf(err, "open %s failed", s.ExtractManifestsYaml)
		}
		defer manifestsYaml.Close()

		manifests, err := manifest.ExtractComplete(resolved)
		if err != nil {
			return errors.Wrapf(err, "extract manifests failed: %s", s.ExtractManifestsYaml)
		}

		for _, m := range manifests {
			data, err := yaml.Marshal(m)
			if err != nil {
				return errors.Wrapf(err, "encoding to yaml failed: %s", s.ExtractManifestsYaml)
			}
			_, _ = manifestsYaml.WriteString("---\n")
			_, _ = manifestsYaml.Write(data)
		}
	}

	return nil
}