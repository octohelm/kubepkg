package auth

import (
	"context"
	"encoding/json"
	"net/url"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/pkg/errors"
	"golang.org/x/oauth2"
)

type OIDC struct {
	// OpenIDConnect Endpoint, when empty, oidc feature disabled.
	Endpoint string `flag:",omitempty"`
}

func (p *OIDC) Init(ctx context.Context) error {
	if p.Endpoint == "" {
		return nil
	}

	op, err := p.New(context.Background())
	if err != nil {
		return err
	}

	RegisterOAuthProvider(ctx, op)
	return nil
}

func (p *OIDC) New(ctx context.Context) (OAuthProvider, error) {
	u, err := url.Parse(p.Endpoint)
	if err != nil {
		return nil, errors.Wrap(err, "parse endpoint failed")
	}

	host := u.Hostname()
	if port := u.Port(); port != "" {
		host += ":"
		host += port
	}

	issuerURL := &url.URL{
		Scheme: u.Scheme,
		Host:   host,
		Path:   u.Path,
	}

	if issuerURL.Path == "/" {
		issuerURL.Path = ""
	}

	issuer := issuerURL.String()

	provider, err := oidc.NewProvider(ctx, issuer)
	if err != nil {
		return nil, err
	}

	clientID := u.User.Username()
	clientSecret, _ := u.User.Password()

	c := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Endpoint:     provider.Endpoint(),
		Scopes:       []string{oidc.ScopeOpenID, "email"},
	}

	return &oidcProvider{
		c: c,
		p: provider,
	}, nil
}

type oidcProvider struct {
	c *oauth2.Config
	p *oidc.Provider
}

func (o *oidcProvider) Name() string {
	return "oidc"
}

func (o *oidcProvider) AuthCodeURL(state string, redirectURI string) string {
	return o.c.AuthCodeURL(state, oauth2.SetAuthURLParam("redirect_uri", redirectURI))
}

func (o *oidcProvider) ExchangeUserInfo(ctx context.Context, code string) (UserInfo, error) {
	tok, err := o.c.Exchange(ctx, code)
	if err != nil {
		if re, ok := err.(*oauth2.RetrieveError); ok {
			r := &statuserror.StatusErr{}
			_ = json.Unmarshal(re.Body, r)
			if r.Code != 0 {
				return nil, r
			}
		}
		return nil, err
	}
	u, err := o.p.UserInfo(ctx, oauth2.StaticTokenSource(tok))
	if err != nil {
		return nil, err
	}

	info := &userInfo{}
	if err := u.Claims(&info.Data); err != nil {
		return nil, err
	}
	return info, nil
}

type userInfo struct {
	Data struct {
		Subject  string `json:"sub"`
		Email    string `json:"email"`
		Mobile   string `json:"mobile,omitempty"`
		Nickname string `json:"nickname,omitempty"`
	}
}

func (u *userInfo) ID() string {
	return u.Data.Subject
}

func (u *userInfo) Email() string {
	return u.Data.Email
}

func (u *userInfo) Nickname() string {
	return u.Data.Nickname
}

func (u *userInfo) Mobile() string {
	return u.Data.Mobile
}
