package auth

import (
	"context"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/pkg/errors"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/pkg/signer"
)

type contextAuth struct{}

func FromContext(ctx context.Context) Auth {
	return ctx.Value(contextAuth{}).(Auth)
}

func ContextWithAuth(ctx context.Context, o Auth) context.Context {
	return context.WithValue(ctx, contextAuth{}, o)
}

type Auth interface {
	ListAuthProvider() (list []*ProviderInfo)
	AuthCodeURL(ctx context.Context, name string, redirectURI string) (redirectTo *url.URL, err error)
	ExchangeToken(ctx context.Context, name string, code string) (token *Token, err error)
}

type TokenExchange struct {
	Type string `json:"type"`
	// When type totp
	Passcode string `json:"passcode,omitempty"`
}

type Token struct {
	AccessToken  string    `json:"access_token"`
	Token        string    `json:"token,omitempty"`
	RefreshToken string    `json:"refresh_token,omitempty"`
	ExpiresIn    int       `json:"expires_in"`
	IssuedAt     time.Time `json:"issued_at"`

	// Token type
	Type string `json:"type"`
	// ext
	ID string `json:"id,omitempty"`
}

type OAuthRegister interface {
	Register(op OAuthProvider)
}

func RegisterOAuthProvider(ctx context.Context, op OAuthProvider) {
	if r, ok := FromContext(ctx).(OAuthRegister); ok {
		r.Register(op)
	}
}

type ProviderInfo struct {
	Type string `json:"type"`
	Name string `json:"name"`
}

type auth struct {
	autoCreatedBy  string
	ae             AccountExchanger
	callback       string
	oauthProviders sync.Map
}

func (a *auth) Register(op OAuthProvider) {
	a.oauthProviders.Store(op.Name(), op)
}

func (a *auth) getOAuthProvider(name string) OAuthProvider {
	if o, ok := a.oauthProviders.Load(name); ok {
		return o.(OAuthProvider)
	}
	return nil
}

func (a *auth) ListAuthProvider() (list []*ProviderInfo) {
	a.oauthProviders.Range(func(key, value any) bool {
		op := value.(OAuthProvider)
		list = append(list, &ProviderInfo{
			Type: "oauth",
			Name: op.Name(),
		})
		return true
	})

	if list == nil {
		list = make([]*ProviderInfo, 0)
	}

	return
}

func (a *auth) AuthCodeURL(ctx context.Context, name string, state string) (*url.URL, error) {
	op := a.getOAuthProvider(name)
	if op == nil {
		return nil, ErrOAuthProviderNotFound
	}
	redirectURL := strings.ReplaceAll(a.callback, "{name}", name)
	if !strings.HasPrefix(redirectURL, "http") {
		// auto added prefix
		if r := courierhttp.HttpRequestFromContext(ctx); r != nil {
			if referer := r.Referer(); referer != "" {
				refererURL, _ := url.Parse(referer)
				refererURL.Path = redirectURL
				redirectURL = refererURL.String()
			}
		}
	}

	u := op.AuthCodeURL(state, redirectURL)
	return url.Parse(u)
}

func (a *auth) ExchangeToken(ctx context.Context, name string, code string) (*Token, error) {
	op := a.getOAuthProvider(name)
	if op == nil {
		return nil, ErrOAuthProviderNotFound
	}
	ui, err := op.ExchangeUserInfo(ctx, code)
	if err != nil {
		return nil, err
	}

	if ui.Email() == "" {
		return nil, errors.Errorf("%s email 不能为空, 请联系管理员", name)
	}

	userContext, err := a.ae.Exchange(ctx, name, ui, a.autoCreatedBy == name)
	if err != nil {
		return nil, err
	}

	ss := signer.FromContext(ctx)

	t := &Token{
		Type: "bearer",
		ID:   userContext[0],
	}

	t.ExpiresIn = int((2 * time.Hour).Seconds())
	t.IssuedAt = time.Now()

	tok, _, err := ss.Sign(ctx, time.Duration(t.ExpiresIn)*time.Second, "access", userContext...)
	if err != nil {
		return nil, err
	}
	t.AccessToken = tok
	t.Token = tok

	refreshTok, _, err := ss.Sign(ctx, 24*time.Hour, "refresh", userContext...)
	if err != nil {
		return nil, err
	}
	t.RefreshToken = refreshTok

	return t, nil
}
