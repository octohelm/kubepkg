package kubepkg

import (
	"archive/tar"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"path"

	"github.com/distribution/distribution/v3/manifest/schema2"

	"github.com/octohelm/kubepkg/pkg/ioutil"

	"github.com/containerd/containerd/images"
	"github.com/containerd/containerd/platforms"
	"github.com/distribution/distribution/v3"
	"github.com/distribution/distribution/v3/reference"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/opencontainers/go-digest"
	ocispecs "github.com/opencontainers/image-spec/specs-go"
	ocispec "github.com/opencontainers/image-spec/specs-go/v1"
	"github.com/pkg/errors"
)

func NewPacker(n distribution.Namespace, optionFuncs ...PackerOptionFunc) *Packer {
	o := &packerOptions{
		FilterBlob: func(d digest.Digest) bool {
			return true
		},
	}
	for i := range optionFuncs {
		optionFuncs[i](o)
	}
	return &Packer{Namespace: n, options: *o}
}

type PackerOptionFunc = func(o *packerOptions)

type packerOptions struct {
	FilterBlob func(d digest.Digest) bool
}

func WithFilterBlob(filterBlob func(d digest.Digest) bool) PackerOptionFunc {
	return func(o *packerOptions) {
		o.FilterBlob = filterBlob
	}
}

type Packer struct {
	distribution.Namespace
	options packerOptions
}

func (p *Packer) KubeTarTo(ctx context.Context, w io.Writer, kpkgs ...*v1alpha1.KubePkg) (dgst digest.Digest, err error) {
	digester := digest.Canonical.Digester()

	mw := io.MultiWriter(w, digester.Hash())
	defer func() {
		// should calc 	digest when gz close
		dgst = digester.Digest()
	}()

	tw := tar.NewWriter(mw)
	defer func() {
		_ = tw.Close()
	}()

	if n := len(kpkgs); n == 1 {
		if err := writeJsonToTar(tw, "kubepkg.json", kpkgs[0]); err != nil {
			return "", err
		}
	} else {
		list := &v1alpha1.KubePkgList{}
		list.SetGroupVersionKind(v1alpha1.SchemeGroupVersion.WithKind("KubePkgList"))
		list.Items = make([]v1alpha1.KubePkg, n)
		for i := range list.Items {
			list.Items[i] = *kpkgs[i]
		}
		if err := writeJsonToTar(tw, "kubepkg.json", list); err != nil {
			return "", err
		}
	}

	for i := range kpkgs {
		if e := p.writeToKubeTar(ctx, tw, kpkgs[i]); e != nil {
			return "", e
		}
	}

	return "", nil
}

type DockerManifest struct {
	Config   string   `json:"Config"`
	RepoTags []string `json:"RepoTags"`
	Layers   []string `json:"Layers"`
}

func (p *Packer) writeToKubeTar(ctx context.Context, tw *tar.Writer, kpkg *v1alpha1.KubePkg) error {
	index := ocispec.Index{
		Versioned: ocispecs.Versioned{SchemaVersion: 2},
	}

	dockerManifest := make([]DockerManifest, 0)

	for i := range kpkg.Status.Digests {
		dm := kpkg.Status.Digests[i]

		named, _ := reference.WithName(dm.Name)

		repo, err := p.Repository(ctx, named)
		if err != nil {
			return err
		}

		pd, err := digest.Parse(dm.Digest)
		if err != nil {
			return err
		}

		switch dm.Type {
		case "blob":
			if p.options.FilterBlob(pd) {
				blobs := repo.Blobs(ctx)
				desc, err := blobs.Stat(ctx, pd)
				if err != nil {
					return errors.Wrapf(err, "[%s] %s@%s", dm.Type, dm.Name, dm.Digest)
				}
				f, err := blobs.Open(ctx, pd)
				if err != nil {
					return errors.Wrapf(err, "[%s] %s@%s", dm.Type, dm.Name, dm.Digest)
				}
				if err := p.copyBlobTo(ctx, tw, f, desc, i, len(kpkg.Status.Digests)); err != nil {
					return errors.Wrapf(err, "[%s] %s@%s", dm.Type, dm.Name, dm.Digest)
				}
			}
		case "manifest":
			manifests, _ := repo.Manifests(ctx)
			m, err := manifests.Get(ctx, pd)
			if err != nil {
				return errors.Wrapf(err, "[%s] %s@%s", dm.Type, dm.Name, dm.Digest)
			}
			mt, payload, err := m.Payload()
			if err != nil {
				return errors.Wrapf(err, "[%s] %s@%s", dm.Type, dm.Name, dm.Digest)
			}

			desc := distribution.Descriptor{
				MediaType: mt,
				Digest:    pd,
				Size:      int64(len(payload)),
				Annotations: map[string]string{
					images.AnnotationImageName: dm.Name,
				},
			}

			if tag := dm.Tag; tag != "" {
				desc.Annotations[ocispec.AnnotationRefName] = tag
				desc.Annotations[images.AnnotationImageName] = fmt.Sprintf("%s:%s", dm.Name, tag)
			}

			switch mt {
			case schema2.MediaTypeManifest:
				dockerM := DockerManifest{}

				if tag := dm.Tag; tag != "" {
					dockerM.RepoTags = append(dockerM.RepoTags, fmt.Sprintf("%s:%s", dm.Name, tag))
				}

				dm := m.(*schema2.DeserializedManifest)

				dockerM.Config = fmt.Sprintf("blobs/%s/%s", dm.Config.Digest.Algorithm(), dm.Config.Digest.Hex())

				dockerM.Layers = make([]string, len(dm.Layers))

				for i, l := range dm.Layers {
					dockerM.Layers[i] = fmt.Sprintf("blobs/%s/%s", l.Digest.Algorithm(), l.Digest.Hex())
				}

				dockerManifest = append(dockerManifest, dockerM)
			}

			if p := dm.Platform; p != "" {
				pp := platforms.MustParse(dm.Platform)
				desc.Platform = &pp
			}

			if err := p.copyBlobTo(ctx, tw, io.NopCloser(bytes.NewReader(payload)), desc, i, len(kpkg.Status.Digests)); err != nil {
				return errors.Wrapf(err, "[%s] %s@%s", dm.Type, dm.Name, dm.Digest)
			}

			switch desc.MediaType {
			case images.MediaTypeDockerSchema2Manifest, ocispec.MediaTypeImageManifest:
				index.Manifests = append(index.Manifests, ocispec.Descriptor{
					MediaType:   desc.MediaType,
					Digest:      desc.Digest,
					Size:        desc.Size,
					URLs:        desc.URLs,
					Annotations: desc.Annotations,
					Platform:    desc.Platform,
				})
			}
		}
	}

	if len(index.Manifests) == 0 {
		return errors.New("invalid oci image: missing manifests")
	}

	if err := writeJsonToTar(tw, "index.json", index); err != nil {
		return err
	}

	// docker compatible
	if len(dockerManifest) > 0 {
		if err := writeJsonToTar(tw, "manifest.json", dockerManifest); err != nil {
			return err
		}
	}

	if err := writeJsonToTar(tw, "oci-layout", map[string]string{"imageLayoutVersion": "1.0.0"}); err != nil {
		return err
	}

	return nil
}

func (p *Packer) copyBlobTo(ctx context.Context, tw *tar.Writer, r io.ReadCloser, desc distribution.Descriptor, i int, total int) error {
	defer func() {
		_ = r.Close()
	}()

	pw := ioutil.NewProgressWriter(ctx, fmt.Sprintf("exporting (%d/%d) %s", i, total, desc.Digest), desc.Size)
	pw.Start()
	defer pw.Stop()

	return copyToTar(tw, io.TeeReader(r, pw), tar.Header{
		Name: path.Join("blobs", desc.Digest.Algorithm().String(), desc.Digest.Hex()),
		Size: desc.Size,
	})
}

func copyToTar(tw *tar.Writer, r io.Reader, header tar.Header) error {
	header.Mode = 0644
	if err := tw.WriteHeader(&header); err != nil {
		return err
	}
	if _, err := io.Copy(tw, r); err != nil {
		return err
	}
	return nil
}

func writeJsonToTar(tw *tar.Writer, filename string, v any) error {
	buf := bytes.NewBuffer(nil)
	if err := json.NewEncoder(buf).Encode(v); err != nil {
		return err
	}
	return copyToTar(tw, buf, tar.Header{
		Name: filename,
		Size: int64(buf.Len()),
	})
}
