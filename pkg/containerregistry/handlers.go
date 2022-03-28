package containerregistry

import (
	"net/http"
	"strings"
)

const (
	mirrorPrefix    = "/mirrors/"
	mirrorHubPrefix = "/hub-prefix-mirrors/"
)

func enableMirrors(nextHandler http.Handler) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		if req.URL.Path == "/" {
			rw.WriteHeader(http.StatusNoContent)
			return
		}

		if strings.HasPrefix(req.URL.Path, mirrorHubPrefix) {
			r := *req
			r.URL.Path = "/v2/" + r.URL.Path[len(mirrorHubPrefix):]
			r.RequestURI = r.URL.RequestURI()
			nextHandler.ServeHTTP(rw, &r)
			return
		}

		if strings.HasPrefix(req.URL.Path, mirrorPrefix) {
			r := *req

			r.URL.Path = "/v2/" + r.URL.Path[len(mirrorPrefix):]

			r.RequestURI = r.URL.RequestURI()
			nextHandler.ServeHTTP(rw, &r)
			return
		}

		nextHandler.ServeHTTP(rw, req)
	})
}
