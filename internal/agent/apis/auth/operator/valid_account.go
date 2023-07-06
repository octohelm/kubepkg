package operator

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/pkg/serverinfo"
	"github.com/octohelm/kubepkg/pkg/signer"

	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/pkg/errors"

	"github.com/octohelm/kubepkg/pkg/agent"
	"github.com/octohelm/kubepkg/pkg/auth"
)

type ValidAccount struct {
	// Bearer access_token
	// Totp passcode@timestamp
	Authorization string `name:"Authorization,omitempty" in:"header"`
}

func (c *ValidAccount) Output(ctx context.Context) (resp any, err error) {
	r := courierhttp.HttpRequestFromContext(ctx)
	defer func() {
		e, ok := serverinfo.EndpointProviderFromContext(ctx).EndpointFor("exchange-token")
		if ok {
			if err != nil {
				err = courierhttp.WrapError(err, courierhttp.WithMetadata(
					"WWW-Authenticate", fmt.Sprintf("Bearer realm=%q,service=%q", e.String(), r.Host),
				))
			}
		}
	}()

	auths := auth.ParseAuthorization(c.Authorization)
	ax := agent.FromContext(ctx)

	code := auths.Get("Totp")
	if ax.OtpKeyURL != "" && code != "" {
		parts := strings.Split(code, "@")
		if len(parts) == 2 {
			ts, err := strconv.ParseInt(parts[1], 10, 64)
			if err == nil {
				if err := ax.ValidateOtp(parts[0], time.Unix(ts, 0)); err != nil {
					return nil, statuserror.Wrap(err, http.StatusUnauthorized, "InvalidOtpPasscode")
				}
				return nil, nil
			}
		}
		return nil, statuserror.Wrap(errors.New("invalid passcode"), http.StatusUnauthorized, "InvalidOtpPasscode")
	} else if token := auths.Get("Bearer"); token != "" {
		if token == ax.Token {
			return nil, nil
		}
		_, err := signer.FromContext(ctx).Validate(ctx, token)
		if err != nil {
			return nil, statuserror.Wrap(err, http.StatusUnauthorized, "InvalidToken")
		}
		return nil, nil
	}

	return nil, statuserror.Wrap(errors.New("invalid access token"), http.StatusUnauthorized, "InvalidAccessToken")
}
