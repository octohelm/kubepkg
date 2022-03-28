package kubepkg

import (
	"archive/tar"
	"compress/gzip"
	"context"
	"encoding/json"
	"io"
	"strings"

	"github.com/distribution/distribution/v3/reference"
	"github.com/distribution/distribution/v3/registry/storage"

	"github.com/distribution/distribution/v3"
	"github.com/distribution/distribution/v3/registry/storage/driver"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/opencontainers/go-digest"
	"github.com/pkg/errors"
)

func NewRegistry(cr distribution.Namespace, ds driver.StorageDriver) *Registry {
	return &Registry{
		cr: cr,
		ds: ds,
	}
}

type Registry struct {
	cr distribution.Namespace
	ds driver.StorageDriver
}

func (reg *Registry) ImportFromReader(ctx context.Context, r io.Reader) (*v1alpha1.KubePkg, error) {
	gzr, err := gzip.NewReader(r)
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = gzr.Close()
	}()

	tr := tar.NewReader(gzr)

	var kpkg *v1alpha1.KubePkg
	var digests map[digest.Digest]v1alpha1.DigestMeta

	var digestMeta = func(d digest.Digest) v1alpha1.DigestMeta {
		if digests == nil {
			digests = map[digest.Digest]v1alpha1.DigestMeta{}
			for i := range kpkg.Status.Digests {
				dm := kpkg.Status.Digests[i]
				dgst, _ := digest.Parse(dm.Digest)
				digests[dgst] = dm
			}
		}
		return digests[d]
	}

	var toTags = map[string]digest.Digest{}

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
			if kpkg == nil {
				return nil, errors.New("invalid kubepkg.tgz, `kubepkg.json` must the first file")
			}

			parts := strings.Split(hdr.Name, "/")
			if len(parts) != 3 {
				return nil, errors.Wrap(err, "invalid kubepkg.tgz, blob path must be `blobs/<alg>/<hash>`")
			}
			d, _ := digest.Parse(strings.Join(parts[1:3], ":"))
			dm := digestMeta(d)

			repo, err := reg.repository(ctx, dm.Name)
			if err != nil {
				return nil, err
			}

			switch dm.Type {
			case "blob":
				if err := reg.importBlob(ctx, repo, tr, distribution.Descriptor{
					Digest: d,
					Size:   int64(dm.Size),
				}); err != nil {
					return nil, errors.Wrapf(err, "import blob %s@%s failed", dm.Name, dm.Digest)
				}
			case "manifest":
				if err := reg.importManifest(ctx, repo, tr, d); err != nil {
					return nil, errors.Wrapf(err, "import manifest %s@%s failed", dm.Name, dm.Digest)
				}

				if dm.Tag != "" {
					if _, ok := toTags[dm.Tag]; !ok {
						if err := repo.Tags(ctx).Tag(ctx, dm.Tag, distribution.Descriptor{
							Digest: d,
						}); err != nil {
							return nil, errors.Wrapf(err, "tag manifest %s:%s@%s failed", dm.Name, dm.Tag, dm.Digest)
						}
						toTags[dm.Tag] = d
					}
				}
			}
		}
	}

	return kpkg, nil
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
