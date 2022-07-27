package blob

import (
	"context"
	"net/http"

	"github.com/distribution/distribution/v3"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	"github.com/opencontainers/go-digest"
	"github.com/pkg/errors"
)

// 查询 blob 状态
type StatBlob struct {
	courierhttp.MethodGet `path:"/blobs/:digest/stat"`
	Digest                string `in:"path" name:"digest"`
}

func (req *StatBlob) Output(ctx context.Context) (any, error) {
	d, err := digest.Parse(req.Digest)
	if err != nil {
		return nil, statuserror.Wrap(err, http.StatusBadRequest, "InvalidDigest")
	}
	stat, err := kubepkg.RegistryFromContext(ctx).Stat(ctx, d)
	if err != nil {
		if errors.Is(err, distribution.ErrBlobUnknown) {
			return nil, statuserror.Wrap(err, http.StatusNotFound, "DigestNotFound")
		}
		return nil, statuserror.Wrap(err, http.StatusInternalServerError, "RegistryError")
	}
	return stat, nil
}
