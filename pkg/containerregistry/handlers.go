package containerregistry

import (
	"context"
	"net/http"
	"strings"

	"github.com/distribution/distribution/v3/registry/handlers"
)

const (
	mirrorPrefix = "/mirrors/"
)

func enableMirrors(nextHandler http.Handler) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		if req.URL.Path == "/" {
			rw.WriteHeader(http.StatusNoContent)
			return
		}

		if strings.HasPrefix(req.URL.Path, mirrorPrefix) {
			r := *req
			paths := strings.SplitN(r.URL.Path[len(mirrorPrefix):], "/", 2)
			ns := req.URL.Query().Get("ns")
			if ns == "" {
				ns = paths[0]
			}
			r.URL.Path = "/v2/" + ns + "/" + paths[1]
			r.RequestURI = r.URL.RequestURI()

			nextHandler.ServeHTTP(rw, &r)
			return
		}

		nextHandler.ServeHTTP(rw, req)
	})
}

type App = handlers.App

type registryAppContext struct {
}

func ContextWithRegistryApp(ctx context.Context, app *App) context.Context {
	return context.WithValue(ctx, registryAppContext{}, app)
}

func RegistryAppFromContext(ctx context.Context) *App {
	if v, ok := ctx.Value(registryAppContext{}).(*App); ok {
		return v
	}
	return nil
}
