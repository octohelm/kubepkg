package signer

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"strconv"
	"time"

	"github.com/pkg/errors"
	"golang.org/x/crypto/pbkdf2"

	"github.com/lestrrat-go/jwx/v2/jwa"
	"github.com/lestrrat-go/jwx/v2/jwk"
	"github.com/lestrrat-go/jwx/v2/jwt"
	"github.com/octohelm/kubepkg/pkg/idgen"
	contextx "github.com/octohelm/x/context"
)

type contextSigner struct{}

func InjectContext(ctx context.Context, s Signer) context.Context {
	return contextx.WithValue(ctx, contextSigner{}, s)
}

func FromContext(ctx context.Context) Signer {
	return ctx.Value(contextSigner{}).(Signer)
}

type Signer interface {
	Sign(ctx context.Context, expiresIn time.Duration, subject string, audience ...string) (string, uint64, error)
	Validate(ctx context.Context, t string) (Token, error)
}

type Token = jwt.Token

type JWTSigner struct {
	Issuer     string `flag:",omitempty"`
	PrivateKey string `flag:",omitempty,secret"`

	privateKey jwk.Key
	jwks       jwk.Set
}

func (s *JWTSigner) InjectContext(ctx context.Context) context.Context {
	return InjectContext(ctx, s)
}

func (s *JWTSigner) SetDefaults() {
	if s.Issuer == "" {
		s.Issuer = "kubepkg.octohelm.tech"
	}
	if s.PrivateKey == "" {
		s.PrivateKey = "LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlDWFFJQkFBS0JnUUN4d2hFUDhXUDBQc0NXTEVSaTdBOGE5V29lejZ2dTBudjRFWExUeFEwV2F0RlAvakpLCnY4VTkxL0NWT2Mzc0FmeTZiWC94U3ExVEs4SEMrOWEyZm1BNlpXREZHVk8yMjU1VGxrb0g4ZEtnUnU2cGwrN1cKNllySTdaajcwU1ZoS3VzUitRTktueTFINDFJL1VCWkMrUnVRWjZQNUVPN0lOWm9kVzcvT0ZOL1Bhd0lEQVFBQgpBb0dBV05zaG5FNldJR21kNjNPRlc4MlVYMjE5OXBqbzRTRG1SMEt4bTVwTXlIL3MwWWZIckFYZ211RnVxYW1UCmZmNGdUekNkWEFod1M3cjd5SFFMQ0g1enF1ZnRUNFBhWXJJRkEvK2cwaE13bkpMcUovZGZjS1dVTEZLaFRCVUcKNnM3NjRxZy9wWWtYbW14L2dLVFdUYlBCSkxzOEtPZFNoRVYySjA1TUN1djJFNEVDUVFEVkhLNm9wYVIwbEI4ZQphaVJaYVIxajd1bzZZd1dpVGNkbGowdlhyQ1ZJN1RHQ2RsRzZ3amYwV25hZ0lWc2d6VVNzOUxvVWpBQVhhTU1xCmVCUWpmT0JUQWtFQTFZZjd6TEFGYldzdWZqYWxuSVJsQ2hTNjZqWEwzTnkzdGRGUEJzUVE0NEtWZTVpdURrTm0KYkN2QnB0WnczTURoNjFDQXlZakRUZTk4aW9hYmIzalJpUUpCQUxaLzhJYVdDMGFXVGl2aW82dzUyeVJvUmdlbwpJdndCOVg3Z2Z3ZDc4UllKb2Z0aVRjMU1ZMVNMWDhqenA3Rm9kNlpSa1VUbE8zTFFrVW0rT1NqRzJPY0NRUUNrCkkvWHhjRldidU1weWh2dGpoM3BMOTRkL1JuOUJkZ0ZhS0YyQksvSjNrUWZyaklBdndxdlc5d1BUaGdBWUVjVVkKcURkM3RFTzlneHpQTjQ0QWNIVlJBa0JPS3hYakNGdVFSUlJUUnFhZjYyalNoWHlZUy9mRUJWMzZJVy9TcS90bwpxbmk5UWVzbmZUaUpMcUFyRTAxbjZtWU1JRDRHODBXV2todzhSWHBHOFl3aQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo="
	}
}

func (s *JWTSigner) Init(ctx context.Context) error {
	if s.privateKey != nil {
		return nil
	}

	pk, err := base64.StdEncoding.DecodeString(s.PrivateKey)
	if err != nil {
		panic(err)
	}

	v, _, err := jwk.DecodePEM(pk)
	if err != nil {
		return err
	}

	rsaPrivateKey, err := jwk.FromRaw(v)
	if err != nil {
		return err
	}

	keyID := genKeyID(s.PrivateKey)

	headers := map[string]interface{}{
		jwk.KeyIDKey:     keyID,
		jwk.AlgorithmKey: jwa.RS256,
		jwk.KeyUsageKey:  jwk.ForSignature,
	}

	for k := range headers {
		if err := rsaPrivateKey.Set(k, headers[k]); err != nil {
			panic(err)
		}
	}

	s.privateKey = rsaPrivateKey

	jwks := jwk.NewSet()
	_ = jwks.AddKey(rsaPrivateKey)
	s.jwks, _ = jwk.PublicSetOf(jwks)

	return nil
}

func (s *JWTSigner) Sign(ctx context.Context, expiresIn time.Duration, subject string, audience ...string) (string, uint64, error) {
	idGen := idgen.FromContext(ctx)
	id, err := idGen.ID()
	if err != nil {
		return "", 0, err
	}

	now := time.Now()

	b := jwt.NewBuilder().
		JwtID(strconv.FormatUint(id, 10)).
		Subject(subject).
		Issuer(s.Issuer).
		Audience(audience).
		IssuedAt(now).
		Expiration(now.Add(expiresIn))

	t, err := b.Build()
	if err != nil {
		return "", 0, err
	}

	signed, err := jwt.Sign(t, jwt.WithKey(jwa.RS256, s.privateKey))
	if err != nil {
		return "", 0, err
	}

	return string(signed), id, nil
}

var (
	ErrInvalidToken = errors.New("invalid token")
)

func (s *JWTSigner) Validate(ctx context.Context, t string) (Token, error) {
	tok, err := jwt.ParseString(t, jwt.WithKeySet(s.jwks))
	if err != nil {
		return nil, ErrInvalidToken
	}

	if tok.Issuer() != s.Issuer {
		return nil, errors.Wrap(ErrInvalidToken, "非法签发来源")
	}

	if len(tok.Audience()) < 1 {
		return nil, errors.Wrap(ErrInvalidToken, "Audience 为空")
	}

	if time.Until(tok.Expiration()) < 0 {
		return nil, errors.Wrap(ErrInvalidToken, "Token 已过期")
	}

	return tok, nil
}

func genKeyID(pk string) string {
	return base64.RawStdEncoding.EncodeToString(pbkdf2.Key([]byte(pk), []byte("octohelm"), 7781, 8, sha256.New))
}
