package client

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/go-logr/logr"
	"github.com/octohelm/kubepkg/pkg/kubepkg/mime"

	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubepkg/agent"
)

func NewAgentClient(endpoint string, httpTransports ...HttpTransport) *Client {
	return &Client{Endpoint: endpoint, HttpTransports: append(httpTransports, LogHttpTransport())}
}

type Client struct {
	Endpoint       string
	HttpTransports []HttpTransport
}

func (c *Client) AgentInfo(ctx context.Context) (*agent.AgentInfo, error) {
	r, err := http.NewRequestWithContext(ctx, http.MethodHead, c.Endpoint, nil)
	if err != nil {
		return nil, err
	}

	cc, err := GetShortConnClientContext(ctx, c.HttpTransports...)
	if err != nil {
		return nil, err
	}

	resp, err := cc.Do(r)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		se := &agent.StatusErr{}
		if err := json.NewDecoder(resp.Body).Decode(se); err != nil {
			return nil, err
		}
		return nil, se
	}

	return agent.FromKubeAgentHead(resp.Header.Get(agent.HEADER_KUBEPKG_AGENT))
}

func (c *Client) ExistsDigest(ctx context.Context, dm *v1alpha1.DigestMeta) (bool, error) {
	r, err := http.NewRequestWithContext(
		ctx,
		http.MethodHead, fmt.Sprintf("%s/blobs/%s", c.Endpoint, dm.Digest),
		nil,
	)
	if err != nil {
		return false, err
	}

	cc, err := GetShortConnClientContext(ctx, c.HttpTransports...)
	if err != nil {
		return false, err
	}

	resp, err := cc.Do(r)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return false, nil
	}

	if resp.StatusCode >= http.StatusBadRequest {
		se := &agent.StatusErr{}
		if err := json.NewDecoder(resp.Body).Decode(se); err != nil {
			return false, err
		}
		return false, se
	}

	return true, nil
}

func (c *Client) ImportDigest(ctx context.Context, dm *v1alpha1.DigestMeta, br io.Reader) error {
	r, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/blobs", c.Endpoint), br)
	if err != nil {
		return err
	}

	r.Header.Set("Content-Type", mime.ToContentType(dm))

	cc, err := GetShortConnClientContext(ctx, c.HttpTransports...)
	if err != nil {
		return err
	}

	resp, err := cc.Do(r)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		se := &agent.StatusErr{}
		if err := json.NewDecoder(resp.Body).Decode(se); err != nil {
			return err
		}
		return se
	}

	return nil
}

func (c *Client) ImportKubePkg(ctx context.Context, kubePkg *v1alpha1.KubePkg) (*v1alpha1.KubePkg, error) {
	data, _ := json.Marshal(kubePkg)

	r, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/kubepkgs", c.Endpoint), bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}

	r.Header.Set("Content-Type", "application/json; encoding=utf-8")

	cc, err := GetShortConnClientContext(ctx, c.HttpTransports...)
	if err != nil {
		return nil, err
	}

	resp, err := cc.Do(r)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		se := &agent.StatusErr{}
		if err := json.NewDecoder(resp.Body).Decode(se); err != nil {
			return nil, err
		}
		return nil, se
	}

	k := &v1alpha1.KubePkg{}
	if err := json.NewDecoder(resp.Body).Decode(k); err != nil {
		return nil, err
	}
	return k, nil
}

func (c *Client) ImportKubePkgTgz(ctx context.Context, tgzReader io.Reader) (*v1alpha1.KubePkg, error) {
	r, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/kubepkgs", c.Endpoint), tgzReader)
	if err != nil {
		return nil, err
	}

	r.Header.Set("Content-Type", mime.MediaTypeKubePkg)

	cc, err := GetShortConnClientContext(ctx, c.HttpTransports...)
	if err != nil {
		return nil, err
	}

	resp, err := cc.Do(r)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		se := &agent.StatusErr{}
		if err := json.NewDecoder(resp.Body).Decode(se); err != nil {
			return nil, err
		}
		return nil, se
	}

	k := &v1alpha1.KubePkg{}
	if err := json.NewDecoder(resp.Body).Decode(k); err != nil {
		return nil, err
	}
	return k, nil
}

func LogHttpTransport() HttpTransport {
	return func(rt http.RoundTripper) http.RoundTripper {
		return RoundTripperFunc(func(req *http.Request) (resp *http.Response, err error) {
			l := logr.FromContextOrDiscard(req.Context())

			started := time.Now()

			defer func() {
				values := []interface{}{
					"cost", time.Since(started),
				}

				if resp != nil {
					values = append(values, "status", resp.StatusCode)
				}

				if ct := req.Header.Get("Content-Type"); ct != "" {
					values = append(values, "req.content-type", ct)
				}

				if resp != nil {
					l2 := l
					if req.Method == http.MethodHead {
						l2 = l2.V(1)
					}
					l2.Info(fmt.Sprintf("%s %s", req.Method, req.URL.String()), values...)
				} else {
					l.Error(err, fmt.Sprintf("%s %s", req.Method, req.URL.String()), values...)
				}
			}()

			return rt.RoundTrip(req)
		})
	}
}
