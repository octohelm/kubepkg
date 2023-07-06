package agent

import (
	"encoding/base32"
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/pquerna/otp"

	"github.com/lestrrat-go/jwx/v2/jwt"
	"github.com/octohelm/storage/pkg/datatypes"
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

		fmt.Println(a.OtpKeyURL)
	}

	a.Time = datatypes.Datetime(time.Now())

	return a, nil

}

type Agent struct {
	Name      string             `json:"name"`
	Token     string             `json:"token,omitempty"`
	Endpoint  string             `json:"endpoint"`
	OtpKeyURL string             `json:"otpKey"`
	Time      datatypes.Datetime `json:"time,omitempty"`
	Labels    map[string]string  `json:"labels,omitempty"`
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

func (a *Agent) ValidateOtp(passcode string, t time.Time) (bool, error) {
	n := time.Now()

	k, err := otp.NewKeyFromURL(a.OtpKeyURL)
	if err != nil {
		return false, err
	}

	return totp.ValidateCustom(passcode, k.Secret(), n, totp.ValidateOpts{
		Skew:      uint(math.Abs(t.Sub(n).Seconds())) + 1,
		Period:    uint(k.Period()),
		Digits:    k.Digits(),
		Algorithm: k.Algorithm(),
	})
}
