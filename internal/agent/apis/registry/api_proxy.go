package registry

import (
	"context"
	"net/http"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/pkg/containerregistry"
)

type APIProxyForContainerRegistry struct {
	courierhttp.Method `path:"/v2/*path"`
}

func (req *APIProxyForContainerRegistry) Output(ctx context.Context) (any, error) {
	return &upgrader{
		app: containerregistry.RegistryAppFromContext(ctx),
	}, nil
}

type upgrader struct {
	app *containerregistry.App
}

func (u *upgrader) Upgrade(w http.ResponseWriter, r *http.Request) (err error) {
	u.app.ServeHTTP(w, r)
	return nil
}
