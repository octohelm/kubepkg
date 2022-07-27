package blob

import (
	"context"
	"io"
	"net/http"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	"github.com/octohelm/kubepkg/pkg/kubepkg/mime"
)

// 上传 blob
type UploadBlob struct {
	courierhttp.MethodPut `path:"/blobs"`
	ContentType           string        `in:"header" name:"Content-Type"`
	Blob                  io.ReadCloser `in:"body" mime:"octet-stream"`
}

func (req *UploadBlob) Output(ctx context.Context) (any, error) {
	dm, err := mime.FromContentType(req.ContentType)
	if err != nil {
		return nil, statuserror.Wrap(err, http.StatusBadRequest, "InvalidContentType")
	}
	defer req.Blob.Close()

	if err := kubepkg.RegistryFromContext(ctx).ImportDigest(ctx, dm, req.Blob); err != nil {
		return nil, statuserror.Wrap(err, http.StatusInternalServerError, "RegistryError")
	}

	return nil, nil
}
