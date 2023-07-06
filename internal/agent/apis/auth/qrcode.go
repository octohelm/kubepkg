package auth

import (
	"bytes"
	"context"
	"image/png"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/pkg/agent"
)

type Qrcode struct {
	courierhttp.MethodGet `path:"/qrcode"`
}

func (r *Qrcode) Output(ctx context.Context) (any, error) {
	img, err := agent.FromContext(ctx).Qrcode()
	if err != nil {
		return nil, err
	}

	buf := bytes.NewBuffer(nil)
	if err := png.Encode(buf, img); err != nil {
		return nil, err
	}
	return courierhttp.Wrap(
		buf,
		courierhttp.WithContentType("image/png"),
	), nil
}
