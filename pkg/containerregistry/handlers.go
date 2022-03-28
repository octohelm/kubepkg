package containerregistry

import (
	"net/http"
	"strings"
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
