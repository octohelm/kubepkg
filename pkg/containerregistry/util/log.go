package util

import (
	"net/http"
	"time"

	"github.com/go-courier/logr"
	"github.com/pkg/errors"
)

func WithLogger() func(next http.RoundTripper) http.RoundTripper {
	return func(next http.RoundTripper) http.RoundTripper {
		return &logRoundTripper{next}
	}
}

type logRoundTripper struct {
	next http.RoundTripper
}

func (l *logRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	started := time.Now()

	resp, err := l.next.RoundTrip(req)
	if err != nil {
		logr.FromContext(req.Context()).Error(errors.Wrapf(err, "request failed: %s %s", req.Method, req.URL))
		return nil, err
	}

	logr.FromContext(req.Context()).
		WithValues(
			"cost", time.Since(started),
			"status", resp.StatusCode,
		).
		Debug("%s %s", req.Method, req.URL)

	return resp, err
}
