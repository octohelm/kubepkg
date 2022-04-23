package httputil

import (
	"fmt"
	"github.com/go-logr/logr"
	"github.com/pkg/errors"
	"net/http"
	"time"
)

func LogHandler(l logr.Logger) func(handler http.Handler) http.Handler {
	return func(handler http.Handler) http.Handler {
		return http.HandlerFunc(func(rws http.ResponseWriter, req *http.Request) {
			nextCtx := req.Context()
			nextCtx = logr.NewContext(nextCtx, l)

			started := time.Now()

			rw := &responseWriter{ResponseWriter: rws}

			handler.ServeHTTP(rw, req.WithContext(nextCtx))

			if !(req.URL.Path == "/") {
				values := []interface{}{
					"cost", time.Since(started),
					"status", rw.StatusCode,
				}

				if ct := req.Header.Get("Content-Type"); ct != "" {
					values = append(values, "req.content-type", ct)
				}

				if rw.StatusCode >= http.StatusInternalServerError {
					l.Error(errors.New("InternalError"), fmt.Sprintf("%s %s", req.Method, req.URL.String()), values...)
				} else {
					l.Info(fmt.Sprintf("%s %s", req.Method, req.URL.String()), values...)
				}

			}
		})
	}
}

type responseWriter struct {
	http.ResponseWriter
	StatusCode int
}

func (rw *responseWriter) WriteHeader(statusCode int) {
	rw.StatusCode = statusCode
	rw.ResponseWriter.WriteHeader(statusCode)
}
