package auth

import (
	"context"

	"github.com/octohelm/kubepkg/pkg/auth"

	"github.com/octohelm/courier/pkg/courierhttp"
)

type ListAuthProvider struct {
	courierhttp.MethodGet `path:"/auth-providers"`
}

func (p *ListAuthProvider) Output(ctx context.Context) (any, error) {
	return auth.FromContext(ctx).ListAuthProvider(), nil
}
