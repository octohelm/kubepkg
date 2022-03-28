package kubepkg

import (
	"archive/tar"
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"io"
	"strings"

	"github.com/distribution/distribution/v3"
	"github.com/distribution/distribution/v3/reference"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/opencontainers/go-digest"
	"github.com/pkg/errors"
)

func NewPacker(n distribution.Namespace) *Packer {
	return &Packer{Namespace: n}
}

type Packer struct {
	distribution.Namespace
}

func (p *Packer) TgzTo(ctx context.Context, kpkg *v1alpha1.KubePkg, w io.Writer) (dgst digest.Digest, err error) {
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

	if e := p.writeToTar(ctx, tw, kpkg); e != nil {
		return "", e
	}

	return "", nil
}

func (p *Packer) writeToTar(ctx context.Context, tw *tar.Writer, kpkg *v1alpha1.KubePkg) error {
	if err := p.writeKubePkgToTar(ctx, tw, kpkg); err != nil {
		return err
	}

	for i := range kpkg.Status.Digests {
		d := kpkg.Status.Digests[i]
		named, _ := reference.WithName(d.Name)

		repo, err := p.Repository(ctx, named)
		if err != nil {
			return err
		}

		pd, err := digest.Parse(d.Digest)
		if err != nil {
			return err
		}

		switch d.Type {
		case "blob":
			blobs := repo.Blobs(ctx)
			desc, err := blobs.Stat(ctx, pd)
			if err != nil {
				return errors.Wrapf(err, "[%s] %s@%s", d.Type, d.Name, d.Digest)
			}
			f, err := blobs.Open(ctx, pd)
			if err != nil {
				return errors.Wrapf(err, "[%s] %s@%s", d.Type, d.Name, d.Digest)
			}
			if err := p.copyBlobTo(ctx, tw, f, desc); err != nil {
				return errors.Wrapf(err, "[%s] %s@%s", d.Type, d.Name, d.Digest)
			}
		case "manifest":
			manifests, _ := repo.Manifests(ctx)
			desc, err := manifests.Get(ctx, pd)
			if err != nil {
				return errors.Wrapf(err, "[%s] %s@%s", d.Type, d.Name, d.Digest)
			}
			_, payload, err := desc.Payload()
			if err != nil {
				return errors.Wrapf(err, "[%s] %s@%s", d.Type, d.Name, d.Digest)
			}
			if err := p.copyBlobTo(ctx, tw, io.NopCloser(bytes.NewReader(payload)), distribution.Descriptor{
				Digest: pd,
				Size:   int64(len(payload)),
			}); err != nil {
				return errors.Wrapf(err, "[%s] %s@%s", d.Type, d.Name, d.Digest)
			}
		}
	}
	return nil
}

func (p *Packer) copyBlobTo(ctx context.Context, tw *tar.Writer, r io.ReadCloser, desc distribution.Descriptor) error {
	defer func() {
		_ = r.Close()
	}()

	h := &tar.Header{
		Name: strings.Join(append([]string{"blobs"}, strings.Split(desc.Digest.String(), ":")...), "/"),
		Size: desc.Size,
		Mode: 0600,
	}

	if err := tw.WriteHeader(h); err != nil {
		return err
	}

	if _, err := io.Copy(tw, r); err != nil {
		return err
	}

	return nil
}

func (p *Packer) writeKubePkgToTar(ctx context.Context, tw *tar.Writer, kpkg *v1alpha1.KubePkg) error {
	buf := bytes.NewBuffer(nil)

	e := json.NewEncoder(buf)
	e.SetIndent("", "  ")

	if err := e.Encode(kpkg); err != nil {
		return err
	}

	header := &tar.Header{
		Name: "kubepkg.json",
		Mode: 0600,
		Size: int64(buf.Len()),
	}

	if err := tw.WriteHeader(header); err != nil {
		return err
	}
	if _, err := io.Copy(tw, buf); err != nil {
		return err
	}
	return nil
}
