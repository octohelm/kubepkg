package agent

import (
	"context"

	"github.com/innoai-tech/infra/pkg/http/middleware"
	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp/client"
	_ "github.com/octohelm/courier/pkg/statuserror"
	"github.com/octohelm/kubepkg/pkg/agent"
	_ "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	_ "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +gengo:client:openapi=http://127.0.0.1:32060/api/kubepkg-agent
// +gengo:client:openapi:include=GetClusterInfo
// +gengo:client:openapi:include=ListKubePkg
// +gengo:client:openapi:include=DelKubePkg
// +gengo:client:openapi:include=ApplyKubePkg
// +gengo:client:openapi:include=GetKubePkg
type Client struct {
	Endpoint  string
	OtpKeyURL string
	Token     string
	c         *client.Client
}

func (c *Client) Init(ctx context.Context) error {
	if c.c == nil {
		a := &agent.Agent{}
		a.Endpoint = c.Endpoint
		a.OtpKeyURL = c.OtpKeyURL
		a.Token = c.Token

		cc := &client.Client{
			Endpoint: c.Endpoint,
			HttpTransports: []client.HttpTransport{
				a.AuthRoundTripper(),
				middleware.NewLogRoundTripper(),
			},
		}
		c.c = cc
	}
	return nil
}

func (c *Client) Do(ctx context.Context, req any, metas ...courier.Metadata) courier.Result {
	return c.c.Do(ctx, req, metas...)
}

func (c *Client) InjectContext(ctx context.Context) context.Context {
	return courier.ContextWithClient(ctx, "agent", c)
}
