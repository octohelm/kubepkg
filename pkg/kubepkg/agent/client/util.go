package client

import (
	"context"
	"net"
	"net/http"
	"time"

	"golang.org/x/net/http2"
)

func RoundTripperFunc(fn func(req *http.Request) (*http.Response, error)) http.RoundTripper {
	return &roundTripperFunc{fn: fn}
}

type roundTripperFunc struct {
	fn func(req *http.Request) (*http.Response, error)
}

func (r *roundTripperFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return r.fn(req)
}

type HttpTransport = func(rt http.RoundTripper) http.RoundTripper

func GetConnClientContext(ctx context.Context, httpTransports ...HttpTransport) (*http.Client, error) {
	t := &http.Transport{
		DialContext: (&net.Dialer{
			Timeout:   5 * time.Second,
			KeepAlive: 0,
		}).DialContext,
		TLSHandshakeTimeout:   5 * time.Second,
		ResponseHeaderTimeout: 1 * time.Hour,
		DisableKeepAlives:     true,
	}

	if err := http2.ConfigureTransport(t); err != nil {
		return nil, err
	}

	c := &http.Client{Transport: t}

	for i := range httpTransports {
		c.Transport = httpTransports[i](c.Transport)
	}

	return c, nil
}

func SliceContains[T comparable](list []T, target T) bool {
	for i := range list {
		if list[i] == target {
			return true
		}
	}
	return false
}
