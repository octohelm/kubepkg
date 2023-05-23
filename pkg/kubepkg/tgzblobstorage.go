package kubepkg

import (
	"context"
	"fmt"
	"io"

	"github.com/distribution/distribution/v3"
	"github.com/distribution/distribution/v3/registry/storage/driver"
	"github.com/google/uuid"
	"github.com/opencontainers/go-digest"
)

type tgzBlobStorage struct {
	driver driver.StorageDriver
}

func (bs *tgzBlobStorage) Open(ctx context.Context, dgst digest.Digest) (io.ReadCloser, error) {
	desc, err := bs.Stat(ctx, dgst)
	if err != nil {
		return nil, err
	}
	return bs.driver.Reader(ctx, blobDataPath(dgst), desc.Size)
}

func (bs *tgzBlobStorage) Stat(ctx context.Context, dgst digest.Digest) (distribution.Descriptor, error) {
	path := blobDataPath(dgst)

	fi, err := bs.driver.Stat(ctx, path)
	if err != nil {
		switch err := err.(type) {
		case driver.PathNotFoundError:
			return distribution.Descriptor{}, distribution.ErrBlobUnknown
		default:
			return distribution.Descriptor{}, err
		}
	}

	return distribution.Descriptor{
		Size:      fi.Size(),
		MediaType: "application/octet-stream",
		Digest:    dgst,
	}, nil
}

func (bs *tgzBlobStorage) Create(ctx context.Context) (BlobWriter, error) {
	id := uuid.New().String()
	uploadPath := blobUploadPath(id)

	fw, err := bs.driver.Writer(ctx, uploadPath, false)
	if err != nil {
		return nil, err
	}

	return &blobWriter{
		id:   id,
		path: uploadPath,

		driver:     bs.driver,
		digester:   digest.Canonical.Digester(),
		FileWriter: fw,
	}, nil
}

type BlobWriter interface {
	io.WriteCloser
	Commit(ctx context.Context, provisional *digest.Digest) (canonical distribution.Descriptor, err error)
}

type blobWriter struct {
	id     string
	path   string
	driver driver.StorageDriver
	driver.FileWriter
	digester digest.Digester
}

func (bw *blobWriter) Write(b []byte) (int, error) {
	_, err := bw.FileWriter.Write(b)
	if err != nil {
		return -1, err
	}
	return bw.digester.Hash().Write(b)
}

func (bw *blobWriter) Commit(ctx context.Context, provisional *digest.Digest) (canonical distribution.Descriptor, err error) {
	if err := bw.FileWriter.Commit(); err != nil {
		return distribution.Descriptor{}, err
	}

	_ = bw.FileWriter.Close()

	desc := distribution.Descriptor{
		Digest: bw.digester.Digest(),
		Size:   bw.Size(),
	}

	if provisional != nil {
		if *provisional != desc.Digest {
			return distribution.Descriptor{}, distribution.ErrBlobInvalidDigest{
				Digest: desc.Digest,
				Reason: fmt.Errorf("content does not match digest"),
			}
		}
	}

	if err := bw.moveBlob(ctx, desc); err != nil {
		return distribution.Descriptor{}, err
	}

	return desc, nil
}

func (bw *blobWriter) moveBlob(ctx context.Context, desc distribution.Descriptor) error {
	blobPath := blobDataPath(desc.Digest)
	return bw.driver.Move(ctx, bw.path, blobPath)
}

func blobDataPath(dgst digest.Digest) string {
	return "/kubepkg/blobs/" + dgst.Algorithm().String() + "/" + dgst.Hex()
}

func blobUploadPath(id string) string {
	return "/kubepkg/_uploads/" + id
}
