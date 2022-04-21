package kubepkg

import (
	"archive/tar"
	"compress/gzip"
	"context"
	"encoding/json"
	"io"
	"strings"

	"github.com/octohelm/kubepkg/pkg/ioutil"

	"github.com/distribution/distribution/v3"
	"github.com/distribution/distribution/v3/reference"
	"github.com/distribution/distribution/v3/registry/storage"
	"github.com/distribution/distribution/v3/registry/storage/driver"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/opencontainers/go-digest"
	"github.com/pkg/errors"
)

func NewRegistry(cr distribution.Namespace, ds driver.StorageDriver) *Registry {
	return &Registry{
		cr:     cr,
		driver: ds,
	}
}

type Registry struct {
	cr     distribution.Namespace
	driver driver.StorageDriver
}

func (reg *Registry) Wrap(ctx context.Context, r io.ReadCloser, dgst *digest.Digest) (io.ReadCloser, error) {
	tbs := &tgzBlobStorage{driver: reg.driver}

	if dgst != nil {
		d := *dgst
		_, err := tbs.Stat(ctx, d)
		if err == nil {
			return tbs.Open(ctx, d)
		}
	}

	bw, err := tbs.Create(ctx)
	if err != nil {
		return nil, err
	}

	rc := &struct {
		io.Closer
		io.Reader
	}{
		Reader: io.TeeReader(r, bw),
		Closer: ioutil.NewCloser(func() error {
			defer func() {
				if e := r.Close(); e != nil {
					err = e
				}
			}()
			_, err = bw.Commit(ctx, dgst)
			return err
		}),
	}

	return rc, nil
}

func KubeTgzRange(ctx context.Context, r io.Reader, each func(ctx context.Context, dm *v1alpha1.DigestMeta, br io.Reader, i, total int) error) (*v1alpha1.KubePkg, error) {
	gzr, err := gzip.NewReader(r)
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = gzr.Close()
	}()

	tr := tar.NewReader(gzr)

	var kpkg *v1alpha1.KubePkg
	var digests map[string]v1alpha1.DigestMeta

	var digestMeta = func(d string) *v1alpha1.DigestMeta {
		if digests == nil {
			digests = map[string]v1alpha1.DigestMeta{}
			for i := range kpkg.Status.Digests {
				dm := kpkg.Status.Digests[i]
				digests[dm.Digest] = dm
			}
		}
		dm := digests[d]
		return &dm
	}

	i := -1

	for {
		hdr, err := tr.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}

		if hdr.Name == "kubepkg.json" {
			var p v1alpha1.KubePkg
			if err := json.NewDecoder(tr).Decode(&p); err != nil {
				return nil, errors.Wrap(err, "extract kubepkg.json failed")
			}
			kpkg = &p
			continue
		}

		if strings.HasPrefix(hdr.Name, "blobs/") {
			i++

			if kpkg == nil {
				return nil, errors.New("invalid kubepkg.tgz, `kubepkg.json` must the first file")
			}

			parts := strings.Split(hdr.Name, "/")
			if len(parts) != 3 {
				return nil, errors.Wrap(err, "invalid kubepkg.tgz, blob path must be `blobs/<alg>/<hash>`")
			}

			if err := each(ctx, digestMeta(strings.Join(parts[1:3], ":")), tr, i, len(kpkg.Status.Digests)); err != nil {
				return nil, err
			}
		}
	}

	return kpkg, nil
}

func (reg *Registry) ImportFromKubeTgzReader(ctx context.Context, r io.Reader) (*v1alpha1.KubePkg, error) {
	return KubeTgzRange(ctx, r, func(ctx context.Context, dm *v1alpha1.DigestMeta, br io.Reader, i, total int) error {
		return reg.ImportDigest(ctx, dm, br)
	})
}

func (reg *Registry) Stat(ctx context.Context, d digest.Digest) (distribution.Descriptor, error) {
	return reg.cr.BlobStatter().Stat(ctx, d)
}

func (reg *Registry) ImportDigest(ctx context.Context, dm *v1alpha1.DigestMeta, r io.Reader) error {
	repo, err := reg.repository(ctx, dm.Name)
	if err != nil {
		return err
	}

	d, _ := digest.Parse(dm.Digest)

	switch dm.Type {
	case "blob":
		if err := reg.importBlob(ctx, repo, r, distribution.Descriptor{
			Digest: d,
			Size:   int64(dm.Size),
		}); err != nil {
			return errors.Wrapf(err, "import blob %s@%s failed", dm.Name, dm.Digest)
		}
	case "manifest":
		if err := reg.importManifest(ctx, repo, r, d); err != nil {
			return errors.Wrapf(err, "import manifest %s@%s failed", dm.Name, dm.Digest)
		}

		if dm.Tag != "" && dm.Platform == "" {
			if err := repo.Tags(ctx).Tag(ctx, dm.Tag, distribution.Descriptor{
				Digest: d,
			}); err != nil {
				return errors.Wrapf(err, "tag manifest %s:%s@%s failed", dm.Name, dm.Tag, dm.Digest)
			}
		}
	}
	return nil
}

func (reg *Registry) importManifest(ctx context.Context, repo distribution.Repository, r io.Reader, d digest.Digest) error {
	manifests, err := repo.Manifests(ctx, storage.SkipLayerVerification())
	if err != nil {
		return err
	}

	if exists, _ := manifests.Exists(ctx, d); exists {
		return nil
	}

	payload, err := io.ReadAll(r)
	if err != nil {
		return err
	}

	header := struct {
		MediaType string `json:"mediaType"`
	}{}

	if err := json.Unmarshal(payload, &header); err != nil {
		return err
	}

	m, _, err := distribution.UnmarshalManifest(header.MediaType, payload)
	if err != nil {
		return err
	}

	if _, err := manifests.Put(ctx, m); err != nil {
		return err
	}

	return nil

}

func (reg *Registry) importBlob(ctx context.Context, repo distribution.Repository, r io.Reader, desc distribution.Descriptor) error {
	blobs := repo.Blobs(ctx)

	_, err := blobs.Stat(ctx, desc.Digest)
	if err == nil {
		return nil
	}

	bw, err := blobs.Create(ctx)
	if err != nil {
		return err
	}

	if _, err := io.Copy(bw, r); err != nil {
		return err
	}

	if _, err := bw.Commit(ctx, desc); err != nil {
		return err
	}

	return nil

}

func (reg *Registry) repository(ctx context.Context, name string) (distribution.Repository, error) {
	named, _ := reference.WithName(name)
	return reg.cr.Repository(ctx, named)
}
