package auth

import (
	"context"
	"encoding/base64"
	"net/http"
	"strings"
	"time"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/octohelm/kubepkg/pkg/agent"
	"github.com/octohelm/kubepkg/pkg/auth"
	"github.com/octohelm/kubepkg/pkg/signer"
	"github.com/pkg/errors"
)

type ExchangeToken struct {
	courierhttp.MethodPost `path:"/token"`
	TokenExchanger
}

func (r *ExchangeToken) EndpointRole() string {
	return "exchange-token"
}

func (r *ExchangeToken) Output(ctx context.Context) (any, error) {
	if r.GrantType != "refresh_token" {
		return nil, statuserror.Wrap(errors.Errorf("invalid grant_type: %s", r.GrantType), http.StatusBadRequest, "InvalidGrantType")
	}

	t, err := signer.FromContext(ctx).Validate(ctx, r.RefreshToken)
	if err != nil {
		return nil, statuserror.Wrap(err, http.StatusForbidden, "InvalidRefreshToken")
	}

	if t.Subject() != "refresh_token" {
		return nil, statuserror.Wrap(err, http.StatusForbidden, "InvalidRefreshToken")
	}

	ax := agent.FromContext(ctx)

	return r.TokenExchanger.Exchange(ctx, ax)
}

type ExchangeTokenAlias struct {
	courierhttp.MethodGet `path:"/token"`
	Authorization         string `name:"Authorization,omitempty" in:"header"`
	TokenExchanger
}

func (a *ExchangeTokenAlias) Output(ctx context.Context) (any, error) {
	ax := agent.FromContext(ctx)
	auths := auth.ParseAuthorization(a.Authorization)

	basicAuth := auths.Get("Basic")
	userpass, _ := base64.StdEncoding.DecodeString(basicAuth)

	parts := strings.SplitN(string(userpass), ":", 2)
	if len(parts) != 2 {
		return nil, statuserror.Wrap(errors.New("invalid user & passcode"), http.StatusForbidden, "InvalidUserPasscode")
	}
	passcode := parts[1]

	if err := ax.ValidateOtp(passcode, time.Now()); err != nil {
		return nil, statuserror.Wrap(err, http.StatusUnauthorized, "InvalidOtpPasscode")
	}

	return a.TokenExchanger.Exchange(ctx, ax)
}

type TokenExchanger struct {
	ClientID     string `name:"client_id,omitempty" in:"query"`
	GrantType    string `name:"grant_type,omitempty" in:"query"`
	RefreshToken string `name:"refresh_token,omitempty" in:"query"`
	Scope        string `name:"scope,omitempty" in:"query"`
}

func (ex *TokenExchanger) Exchange(ctx context.Context, ax *agent.Agent) (any, error) {
	ss := signer.FromContext(ctx)

	t := &auth.Token{
		Type: "bearer",
		ID:   ax.Name,
	}

	t.ExpiresIn = int((2 * time.Hour).Seconds())
	t.IssuedAt = time.Now()

	tok, _, err := ss.Sign(ctx, time.Duration(t.ExpiresIn)*time.Second, "access_token", t.ID)
	if err != nil {
		return nil, err
	}
	t.AccessToken = tok
	t.Token = tok

	refTok, _, err := ss.Sign(ctx, time.Duration(t.ExpiresIn*12)*time.Second, "refresh_token", t.ID)
	if err != nil {
		return nil, err
	}
	// must with this for local store
	t.RefreshToken = refTok

	return t, nil
}
