package auth

import (
	"context"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/pkg/auth"
)

type ExchangeToken struct {
	courierhttp.MethodPost `path:"/auth-providers/:name/token"`
	AuthProviderName       string `name:"name" in:"path"`
	ExchangeTokenData      `in:"body"`
}

func (a *ExchangeToken) Output(ctx context.Context) (any, error) {
	au := auth.FromContext(ctx)
	return au.ExchangeToken(ctx, a.AuthProviderName, a.Code)
}

type ExchangeTokenData struct {
	Code string `json:"code"`
}
