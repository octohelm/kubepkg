package agent

import (
	"context"
	"time"

	"github.com/octohelm/kubepkg/pkg/serverinfo"

	"github.com/octohelm/kubepkg/pkg/signer"
	"github.com/pkg/errors"
)

type Registry interface {
	NewAccessToken(ctx context.Context, name string, optFns ...AccessTokenOptionFunc) (string, error)
	Validate(ctx context.Context, agent *Agent) error
}

type AccessTokenOptionFunc = func(o *accessTokenOptions)

func accessTokenOptionsFrom(optFns ...AccessTokenOptionFunc) *accessTokenOptions {
	o := &accessTokenOptions{
		ExpiresIn: 90 * 24 * time.Hour,
	}
	for i := range optFns {
		optFns[i](o)
	}
	return o
}

func AsRegistryEndpoint(b bool) AccessTokenOptionFunc {
	return func(o *accessTokenOptions) {
		o.AsRegistryEndpoint = b
	}
}

func ExpiresIn(d time.Duration) AccessTokenOptionFunc {
	return func(o *accessTokenOptions) {
		o.ExpiresIn = d
	}
}

type accessTokenOptions struct {
	AsRegistryEndpoint bool
	ExpiresIn          time.Duration
}

func NewRegister() Registry {
	return &register{}
}

type register struct {
}

const ENDPOINT_ROLE = "agent-registry"

func (*register) NewAccessToken(ctx context.Context, id string, optFns ...AccessTokenOptionFunc) (string, error) {
	opt := accessTokenOptionsFrom(optFns...)
	tokenStr, _, err := signer.FromContext(ctx).Sign(ctx, opt.ExpiresIn, "k8s-agent", id, "AGENT")
	if err != nil {
		return "", err
	}
	if opt.AsRegistryEndpoint {
		p := serverinfo.EndpointProviderFromContext(ctx)

		base, ok := p.EndpointFor(ENDPOINT_ROLE)
		if ok {
			q := base.Query()
			q.Set("x-param-header-Authorization", "Bearer "+tokenStr)
			base.RawQuery = q.Encode()
			return base.String(), nil
		}

	}
	return tokenStr, nil
}

func (*register) Validate(ctx context.Context, agent *Agent) error {
	t, err := signer.FromContext(ctx).Validate(ctx, agent.Token)
	if err != nil {
		return err
	}
	if t.Subject() != "k8s-agent" {
		return errors.New("invalid token")
	}
	return nil
}
