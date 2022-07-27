package auth

import (
	"context"
	"net/http"

	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/octohelm/kubepkg/pkg/auth"

	"github.com/octohelm/courier/pkg/courierhttp"
)

type Authorize struct {
	courierhttp.MethodGet `path:"/auth-providers/:name/authorize"`
	ProviderName          string `name:"name" in:"path"`
	State                 string `name:"state,omitempty" in:"query"`
}

func (a *Authorize) Output(ctx context.Context) (any, error) {
	r, err := auth.FromContext(ctx).AuthCodeURL(ctx, a.ProviderName, a.State)
	if err != nil {
		return nil, statuserror.Wrap(err, http.StatusBadRequest, "ToAuthorizeFailed")
	}
	return courierhttp.Redirect(http.StatusFound, r), nil
}
