package kubepkg

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"fmt"
	"github.com/octohelm/kubepkg/pkg/ioutil"
	"io"
	"path"

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

func NewPacker(n distribution.Namespace) *Packer {
	return &Packer{Namespace: n}
}

type Packer struct {
	distribution.Namespace
}

func (p *Packer) KubeTgzTo(ctx context.Context, kpkg *v1alpha1.KubePkg, w io.Writer) (dgst digest.Digest, err error) {
	digester := digest.Canonical.Digester()

	mw := io.MultiWriter(w, digester.Hash())

	gw := gzip.NewWriter(mw)
	defer func() {
		_ = gw.Close()
		// should calc 	digest when gz close
		dgst = digester.Digest()
	}()

	tw := tar.NewWriter(gw)
	defer func() {
		_ = tw.Close()
	}()

	if e := p.writeToKubeTar(ctx, tw, kpkg); e != nil {
		return "", e
	}

	return "", nil
}

func (p *Packer) writeToKubeTar(ctx context.Context, tw *tar.Writer, kpkg *v1alpha1.KubePkg) error {
	if err := writeJsonToTar(tw, "kubepkg.json", kpkg); err != nil {
		return err
	}

	index := ocispec.Index{
		Versioned: ocispecs.Versioned{SchemaVersion: 2},
	}

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

			if p := dm.Platform; p != "" {
				pp := platforms.MustParse(dm.Platform)
				desc.Platform = &pp
			}

			if err := p.copyBlobTo(ctx, tw, io.NopCloser(bytes.NewReader(payload)), desc, i, len(kpkg.Status.Digests)); err != nil {
				return errors.Wrapf(err, "[%s] %s@%s", dm.Type, dm.Name, dm.Digest)
			}

			switch desc.MediaType {
			case images.MediaTypeDockerSchema2Manifest:
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

	if err := writeJsonToTar(tw, "index.json", index); err != nil {
		return err
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
