package proxy

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"strconv"

	"github.com/pkg/errors"

	"github.com/octohelm/kubepkg/pkg/ioutil"

	"github.com/distribution/distribution/v3"
	"github.com/distribution/distribution/v3/reference"
	"github.com/opencontainers/go-digest"
)

type proxyBlobStore struct {
	localStore     distribution.BlobStore
	remoteStore    distribution.BlobService
	repositoryName reference.Named
	authChallenger authChallenger
}

var _ distribution.BlobStore = &proxyBlobStore{}

func SetResponseHeaders(w http.ResponseWriter, descriptor distribution.Descriptor) {
	w.Header().Set("Content-Length", strconv.FormatInt(descriptor.Size, 10))
	w.Header().Set("Content-Type", descriptor.MediaType)
	w.Header().Set("Docker-Content-Digest", descriptor.Digest.String())
	w.Header().Set("Etag", descriptor.Digest.String())
}

func (pbs *proxyBlobStore) ServeBlob(ctx context.Context, w http.ResponseWriter, r *http.Request, dgst digest.Digest) error {
	d, err := pbs.Stat(ctx, dgst)
	if err != nil {
		return err
	}

	SetResponseHeaders(w, d)

	blobReader, err := pbs.Open(ctx, dgst)
	if err != nil {
		return err
	}
	defer func() {
		_ = blobReader.Close()
	}()

	w.WriteHeader(http.StatusOK)
	_, _ = io.Copy(w, blobReader)

	return nil
}

func (pbs *proxyBlobStore) Put(ctx context.Context, mediaType string, p []byte) (distribution.Descriptor, error) {
	return pbs.localStore.Put(ctx, mediaType, p)
}

func (pbs *proxyBlobStore) Create(ctx context.Context, options ...distribution.BlobCreateOption) (distribution.BlobWriter, error) {
	return pbs.localStore.Create(ctx, options...)
}

func (pbs *proxyBlobStore) Resume(ctx context.Context, id string) (distribution.BlobWriter, error) {
	return pbs.localStore.Resume(ctx, id)
}

func (pbs *proxyBlobStore) Delete(ctx context.Context, dgst digest.Digest) error {
	return pbs.localStore.Delete(ctx, dgst)
}

func (pbs *proxyBlobStore) Stat(ctx context.Context, dgst digest.Digest) (distribution.Descriptor, error) {
	desc, err := pbs.localStore.Stat(ctx, dgst)
	if err == nil {
		return desc, err
	}

	if !errors.Is(err, distribution.ErrBlobUnknown) {
		return distribution.Descriptor{}, err
	}

	if err := pbs.authChallenger.tryEstablishChallenges(ctx); err != nil {
		return distribution.Descriptor{}, err
	}

	d, err := pbs.remoteStore.Stat(ctx, dgst)
	if err != nil {
		if errors.Is(err, distribution.ErrBlobUnknown) {
			// FIXME hack to use open to trigger remote sync
			// harbor will return 404 when stat, util digest full synced
			b, err := pbs.remoteStore.Open(ctx, dgst)
			if err != nil {
				return distribution.Descriptor{}, err
			}

			bw, err := pbs.localStore.Create(ctx)
			if err != nil {
				return distribution.Descriptor{}, err
			}
			if _, err := io.Copy(bw, b); err != nil {
				return distribution.Descriptor{}, err
			}
			defer b.Close()
			if _, err := bw.Commit(ctx, distribution.Descriptor{Digest: dgst}); err != nil {
				return distribution.Descriptor{}, err
			}
			// use local stat
			return pbs.localStore.Stat(ctx, dgst)
		}

		return distribution.Descriptor{}, err
	}
	return d, nil
}

func (pbs *proxyBlobStore) Get(ctx context.Context, dgst digest.Digest) ([]byte, error) {
	buf := bytes.NewBuffer(nil)
	r, err := pbs.Open(ctx, dgst)
	if err != nil {
		return nil, err
	}
	if _, err := io.Copy(buf, r); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func (pbs *proxyBlobStore) Open(ctx context.Context, dgst digest.Digest) (distribution.ReadSeekCloser, error) {
	blob, err := pbs.localStore.Open(ctx, dgst)
	if err == nil {
		return blob, nil
	}

	if err := pbs.authChallenger.tryEstablishChallenges(ctx); err != nil {
		return nil, err
	}

	blob, err = pbs.remoteStore.Open(ctx, dgst)
	if err != nil {
		return nil, err
	}

	bw, err := pbs.localStore.Create(ctx)
	if err != nil {
		return nil, err
	}

	rsc := &struct {
		io.Reader
		io.Closer
		io.Seeker
	}{
		Seeker: blob,
		Reader: io.TeeReader(blob, bw),
		Closer: ioutil.NewCloser(func() error {
			defer func() {
				err = blob.Close()
			}()
			_, err = bw.Commit(ctx, distribution.Descriptor{
				Digest: dgst,
			})
			return err
		}),
	}

	return rsc, nil
}
