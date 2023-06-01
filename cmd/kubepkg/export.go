package main

import (
	"context"
	"fmt"
	"strings"

	"github.com/opencontainers/go-digest"

	"sigs.k8s.io/yaml"

	"github.com/go-courier/logr"
	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
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

// Export kubepkg.tgz from kubepkg manifest
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

	// For create patcher
	SinceKubepkgJSON string `flag:"since,omitempty"`
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
	kubepkgs, err := kubepkg.Load(s.KubepkgJSON)
	if err != nil {
		return err
	}
	if len(kubepkgs) == 0 {
		return errors.New("at least one kubepkg")
	}

	l := logr.FromContext(ctx)

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

	ext := ".kube.tgz"

	if s.SinceKubepkgJSON != "" {
		previousKubepkgs, err := kubepkg.Load(s.SinceKubepkgJSON)
		if err != nil {
			return err
		}
		if err := s.resolveDigests(ctx, dr, previousKubepkgs); err != nil {
			return err
		}
		if len(previousKubepkgs) == 0 {
			return errors.New("at least one kubepkg")
		}

		blobsExists := map[string]bool{}

		for i := range previousKubepkgs {
			for _, d := range previousKubepkgs[i].Status.Digests {
				if d.Type == v1alpha1.DigestMetaBlob {
					blobsExists[d.Digest] = true
				}
			}
		}

		p = kubepkg.NewPacker(cr, kubepkg.WithFilterBlob(func(d digest.Digest) bool {
			return !blobsExists[d.String()]
		}))

		ext = fmt.Sprintf(".patch.since.%s-%s.kube.tgz", previousKubepkgs[0].Name, previousKubepkgs[0].Spec.Version)
	}

	output := s.Output
	if strings.HasSuffix(output, "/") {
		platform := "all"
		if len(s.Platform) == 1 {
			platform = strings.ReplaceAll(s.Platform[0], "/", "-")
		}
		output = fmt.Sprintf("%s%s-%s-%s%s", output, kubepkgs[0].Name, kubepkgs[0].Spec.Version, platform, ext)
	}

	tgz, err := ioutil.CreateOrOpen(output)
	if err != nil {
		return errors.Errorf("open output %s failed", output)
	}
	defer tgz.Close()

	if err := s.resolveDigests(ctx, dr, kubepkgs); err != nil {
		return err
	}

	d, err := p.KubeTgzTo(ctx, tgz, kubepkgs...)
	if err != nil {
		return err
	}

	l.WithValues("digest", d).Info("%s generated.", output)

	if s.ExtractManifestsYaml != "" {
		manifestsYamlFile, err := ioutil.CreateOrOpen(s.ExtractManifestsYaml)
		if err != nil {
			return errors.Wrapf(err, "open %s failed", s.ExtractManifestsYaml)
		}
		defer manifestsYamlFile.Close()

		for i := range kubepkgs {
			manifests, err := manifest.ExtractComplete(kubepkgs[i])
			if err != nil {
				return errors.Wrapf(err, "extract manifests failed: %s", s.ExtractManifestsYaml)
			}
			for _, m := range manifests {
				data, err := yaml.Marshal(m)
				if err != nil {
					return errors.Wrapf(err, "encoding to yaml failed: %s", s.ExtractManifestsYaml)
				}
				_, _ = manifestsYamlFile.WriteString("---\n")
				_, _ = manifestsYamlFile.Write(data)
			}
		}
	}

	return nil
}

func (s *Exporter) resolveDigests(ctx context.Context, dr *kubepkg.DigestResolver, kubepkgs []*v1alpha1.KubePkg) error {
	for i := range kubepkgs {
		kpkg := kubepkgs[i]

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
		kubepkgs[i] = resolved
	}
	return nil
}
