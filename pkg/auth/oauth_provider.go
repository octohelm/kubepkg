package auth

import (
	"context"

	"github.com/pkg/errors"
)

var (
	ErrOAuthProviderNotFound = errors.New("OAuthProvider Not Found")
)

type OAuthProvider interface {
	Name() string
	AuthCodeURL(state string, redirectURL string) string
	ExchangeUserInfo(ctx context.Context, code string) (UserInfo, error)
}

type UserInfo interface {
	ID() string
	Email() string
	Mobile() string
	Nickname() string
}
