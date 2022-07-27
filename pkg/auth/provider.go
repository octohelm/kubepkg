package auth

import "context"

type AccountExchanger interface {
	Exchange(ctx context.Context, from string, user UserInfo, createIfNotExists bool) ([]string, error)
}

type Provider struct {
	// Should be full callback URI
	// example https://host/authorize/callback/{name}
	RedirectURI   string `flag:",omitempty"`
	AutoCreatedBy string `flag:",omitempty"`
	a             *auth
	ae            AccountExchanger
}

func (c *Provider) SetAccountExchanger(ae AccountExchanger) {
	c.ae = ae
}

func (c *Provider) SetDefaults() {
	if c.RedirectURI == "" {
		c.RedirectURI = "/authorize/callback/{name}"
	}

	if c.AutoCreatedBy == "" {
		c.AutoCreatedBy = "oidc"
	}
}

func (c *Provider) Init(ctx context.Context) error {
	if c.a != nil {
		return nil
	}

	c.a = &auth{
		autoCreatedBy: c.AutoCreatedBy,
		callback:      c.RedirectURI,
		ae:            c.ae,
	}

	return nil
}

func (c *Provider) InjectContext(ctx context.Context) context.Context {
	return ContextWithAuth(ctx, c.a)
}
