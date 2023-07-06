package agent

import (
	"context"
	"fmt"
	"image"
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/pkg/errors"

	"github.com/octohelm/courier/pkg/courierhttp/client"

	"encoding/base32"

	"github.com/lestrrat-go/jwx/v2/jwt"
	"github.com/octohelm/kubepkg/pkg/datatypes"
	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"
)

func ParseAgentToken(token string, salt ...string) (*Agent, error) {
	t, err := jwt.ParseInsecure([]byte(token))
	if err != nil {
		return nil, err
	}

	a := &Agent{}
	a.Token = token
	if audience := t.Audience(); len(audience) != 0 {
		a.Name = audience[0]
	}

	if id := t.JwtID(); id != "" {
		k, _ := totp.Generate(totp.GenerateOpts{
			Issuer:      "agent.kubepkg.octohelm.com",
			AccountName: a.Name,
			Period:      30,
			Algorithm:   otp.AlgorithmSHA1,
			Digits:      otp.DigitsSix,
			Secret:      []byte(base32.StdEncoding.EncodeToString([]byte(strings.Join(append([]string{id}, salt...), "/")))),
		})

		a.OtpKeyURL = k.URL()
	}

	a.Time = datatypes.Datetime(time.Now())

	return a, nil

}

type Agent struct {
	Name     string `json:"name"`
	Endpoint string `json:"endpoint"`

	Token     string `json:"token,omitempty"`
	OtpKeyURL string `json:"otpKeyURL,omitempty"`

	Time   datatypes.Datetime `json:"time,omitempty"`
	Labels map[string]string  `json:"labels,omitempty"`
}

func (a *Agent) GenerateOtp() (string, time.Time, error) {
	k, err := otp.NewKeyFromURL(a.OtpKeyURL)
	if err != nil {
		return "", time.Time{}, err
	}

	n := time.Now()

	c, err := totp.GenerateCodeCustom(k.Secret(), n, totp.ValidateOpts{
		Skew:      1,
		Period:    uint(k.Period()),
		Digits:    k.Digits(),
		Algorithm: k.Algorithm(),
	})
	return c, n, err
}

func (a *Agent) Qrcode() (image.Image, error) {
	k, err := otp.NewKeyFromURL(a.OtpKeyURL)
	if err != nil {
		return nil, err
	}
	return k.Image(512, 512)
}

func (a *Agent) ValidateOtp(passcode string, t time.Time) error {
	n := time.Now()

	k, err := otp.NewKeyFromURL(a.OtpKeyURL)
	if err != nil {
		return err
	}

	ok, err := totp.ValidateCustom(passcode, k.Secret(), n, totp.ValidateOpts{
		Skew:      uint(math.Abs(t.Sub(n).Seconds())) + 1,
		Period:    uint(k.Period()),
		Digits:    k.Digits(),
		Algorithm: k.Algorithm(),
	})
	if err != nil {
		return err
	}

	if !ok {
		return errors.New("invalid passcode")
	}

	return nil
}

func (a *Agent) AuthRoundTripper() client.HttpTransport {
	return func(rt http.RoundTripper) http.RoundTripper {
		return &authRoundTripper{
			nextRoundTripper: rt,
			a:                a,
		}
	}
}

type authRoundTripper struct {
	nextRoundTripper http.RoundTripper
	a                *Agent
}

func (a *authRoundTripper) RoundTrip(request *http.Request) (*http.Response, error) {
	if a.a.OtpKeyURL != "" {
		passcode, t, err := a.a.GenerateOtp()
		if err != nil {
			return nil, err
		}
		request.Header.Set("Authorization", fmt.Sprintf("Totp %s@%d", passcode, t.Unix()))
		return a.nextRoundTripper.RoundTrip(request)
	}
	request.Header.Set("Authorization", fmt.Sprintf("Bearer %s", a.a.Token))
	return a.nextRoundTripper.RoundTrip(request)
}

type agentContext struct {
}

func FromContext(ctx context.Context) *Agent {
	if a, ok := ctx.Value(agentContext{}).(*Agent); ok {
		return a
	}
	return nil
}

func WithContext(ctx context.Context, a *Agent) context.Context {
	return context.WithValue(ctx, agentContext{}, a)
}
