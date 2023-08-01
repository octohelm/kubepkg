package main

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	corev1 "k8s.io/api/core/v1"

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

	Namespace string `flag:",omitempty"`

	// Ignore image locked sha256 digest
	ForceResolve bool `flag:",omitempty"`
	// Output path for airgap.tar
	OutputOci string `flag:",omitempty"`
	// Supported platforms
	Platform []string `flag:",omitempty"`
	// For create patcher
	SinceKubepkgJSON string `flag:"since,omitempty"`

	ManifestDumper
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

	for _, kpkg := range kubepkgs {
		if s.Namespace != "" {
			kpkg.Namespace = s.Namespace
		}
	}

	l := logr.FromContext(ctx)

	if s.OutputOci != "" {
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
		}

		tgz, err := ioutil.CreateOrOpen(s.OutputOci)
		if err != nil {
			return errors.Errorf("open output %s failed", s.OutputOci)
		}
		defer tgz.Close()

		kubepkgsForExport := make([]*v1alpha1.KubePkg, len(kubepkgs))
		for i := range kubepkgsForExport {
			kubepkgsForExport[i] = kubepkgs[i].DeepCopy()
		}
		if err := s.resolveDigests(ctx, dr, kubepkgsForExport); err != nil {
			return err
		}
		d, err := p.KubeTarTo(ctx, tgz, kubepkgsForExport...)
		if err != nil {
			return err
		}

		l.WithValues("digest", d).Info("%s generated.", s.OutputOci)
	}

	return s.ManifestDumper.DumpManifests(kubepkgs)
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

type ManifestDumper struct {
	// output manifests yaml
	OutputManifests string `flag:",omitempty"`
	// output external ConfigMap DataFiles with annotation `config.kubepkg.octohelm.tech/type=external`
	OutputDirExternalConfig string `flag:",omitempty"`
}

func (s *ManifestDumper) DumpManifests(kubepkgs []*v1alpha1.KubePkg) error {
	if s.OutputDirExternalConfig != "" {
		for i := range kubepkgs {
			manifests, err := manifest.ExtractSorted(kubepkgs[i])
			if err != nil {
				return errors.Wrapf(err, "extract manifests failed: %s", s.OutputManifests)
			}
			for _, m := range manifests {
				if m.GetObjectKind().GroupVersionKind().Kind == "ConfigMap" {
					annotations := m.GetAnnotations()
					if annotations != nil {
						if ct, ok := annotations["config.kubepkg.octohelm.tech/type"]; ok && ct == "external" {
							cm, err := manifest.FromUnstructured[corev1.ConfigMap](m)
							if err != nil {
								return err
							}
							for k, contents := range cm.Data {
								if err := func(filename string, contents string) error {
									configFile, err := ioutil.CreateOrOpen(filepath.Join(s.OutputDirExternalConfig, filename))
									if err != nil {
										return err
									}
									defer configFile.Close()
									_, err = configFile.WriteString(contents)
									return err
								}(k, contents); err != nil {
									return err
								}
							}
						}
					}
				}
			}
		}
	}

	if s.OutputManifests != "" {
		var w io.Writer = os.Stdout

		if s.OutputManifests != "-" {
			manifestsYamlFile, err := ioutil.CreateOrOpen(s.OutputManifests)
			if err != nil {
				return errors.Wrapf(err, "open %s failed", s.OutputManifests)
			}
			defer manifestsYamlFile.Close()

			w = manifestsYamlFile
		}

		for i := range kubepkgs {
			manifests, err := manifest.ExtractSorted(kubepkgs[i])
			if err != nil {
				return errors.Wrapf(err, "extract manifests failed: %s", s.OutputManifests)
			}
			for _, m := range manifests {
				data, err := yaml.Marshal(m)
				if err != nil {
					return errors.Wrapf(err, "encoding to yaml failed: %s", s.OutputManifests)
				}
				_, _ = fmt.Fprint(w, "---\n")
				_, _ = w.Write(data)
			}
		}
	}

	return nil
}
