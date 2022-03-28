package proxy

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"strconv"

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

	if err != distribution.ErrBlobUnknown {
		return distribution.Descriptor{}, err
	}

	if err := pbs.authChallenger.tryEstablishChallenges(ctx); err != nil {
		return distribution.Descriptor{}, err
	}

	return pbs.remoteStore.Stat(ctx, dgst)
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
	return &localSyncer{ctx: ctx, digest: dgst, r: blob, w: bw}, nil
}

type localSyncer struct {
	ctx    context.Context
	digest digest.Digest
	r      distribution.ReadSeekCloser
	w      distribution.BlobWriter
}

func (s *localSyncer) Seek(offset int64, whence int) (int64, error) {
	return s.r.Seek(offset, whence)
}

func (s *localSyncer) Read(p []byte) (int, error) {
	n, err := s.r.Read(p)
	if err != nil {
		if err != io.EOF {
			return n, err
		}
	}
	_, _ = s.w.Write(p[0:n])
	return n, err
}

func (s *localSyncer) Close() (err error) {
	defer func() {
		err = s.r.Close()
	}()

	_, err = s.w.Commit(s.ctx, distribution.Descriptor{
		Digest: s.digest,
	})
	return
}
