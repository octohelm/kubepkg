package client

import (
	"context"
	"net/http"
	"net/url"
	"strings"

	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"

	"github.com/distribution/distribution/v3"
	"github.com/distribution/distribution/v3/reference"
	"github.com/distribution/distribution/v3/registry/client"
	"github.com/distribution/distribution/v3/registry/client/transport"
	"github.com/octohelm/kubepkg/pkg/containerregistry/util"
)

type Client struct {
	Registry       RemoteRegistry
	KeepOriginHost bool

	u              *url.URL
	authChallenger AuthChallenger
}

func (c *Client) Repository(ctx context.Context, name reference.Named) (distribution.Repository, error) {
	name = c.FixedNamed(name)

	if err := c.AuthChallenger().TryEstablishChallenges(ctx); err != nil {
		return nil, err
	}

	tr := transport.NewTransport(
		http.DefaultTransport,
		NewAuthorizer(ctx, c.AuthChallenger(), name, []string{"pull", "push"}),
	)

	return client.NewRepository(name, c.Registry.Endpoint, util.WithLogger()(tr))
}

func (c *Client) AuthChallenger() AuthChallenger {
	if c.authChallenger == nil {
		authChallenger, err := NewAuthChallenger(c.URL(), c.Registry.Username, c.Registry.Password)
		if err != nil {
			panic(err)
		}
		c.authChallenger = authChallenger
	}
	return c.authChallenger
}

func (c *Client) FixedNamed(named reference.Named) reference.Named {
	if c.KeepOriginHost {
		return named
	}
	// <ANY_HOST>/xxx/yyy => xxx/yyy
	parts := strings.Split(named.Name(), "/")
	fixedNamed, _ := reference.WithName(strings.Join(parts[1:], "/"))
	return fixedNamed
}

func (c *Client) Host() string {
	return c.URL().Host
}

func (c *Client) URL() *url.URL {
	if c.u == nil {
		u, err := url.Parse(c.Registry.Endpoint)
		if err != nil {
			panic(err)
		}
		c.u = u
	}

	return c.u
}

func (c *Client) UpdateImages(kubepkgs []*v1alpha1.KubePkg) []*v1alpha1.KubePkg {
	for i := range kubepkgs {
		for name, container := range kubepkgs[i].Spec.Containers {
			n, _ := reference.ParseNamed(container.Image.Name)
			container.Image.Name = c.Host() + "/" + c.FixedNamed(n).String()
			kubepkgs[i].Spec.Containers[name] = container
		}
	}
	return kubepkgs
}
