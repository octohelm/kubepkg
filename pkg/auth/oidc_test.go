package auth

import (
	"context"
	"net/url"
	"os"
	"strings"
	"testing"

	"github.com/davecgh/go-spew/spew"
	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/launcher"
	"github.com/go-rod/rod/lib/proto"
	"github.com/octohelm/kubepkg/internal/testingutil"
)

func TestOIDC(t *testing.T) {
	if os.Getenv("CI") != "" {
		t.Skip()
	}

	o := &OIDC{
		Endpoint: os.Getenv("OIDC_PROVIDER"),
	}

	redirectURL := "https://octohelm.local"

	a, err := o.New(context.Background())
	testingutil.Expect(t, err, testingutil.Be[error](nil))

	t.Run("nav to a code url", func(t *testing.T) {
		code := ExchangeAuthCode(t, a.AuthCodeURL("x", redirectURL), redirectURL)

		t.Run("exchange usr info", func(t *testing.T) {
			usr, err := a.ExchangeUserInfo(context.Background(), code)
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			spew.Dump(usr)
		})
	})
}

func ExchangeAuthCode(t testing.TB, authCodeURL, redirectURI string) string {
	code := ""

	path, _ := launcher.LookPath()
	chrome := launcher.New().Headless(false).Bin(path).MustLaunch()
	b := rod.New().ControlURL(chrome).MustConnect()
	defer b.MustClose()

	err := rod.Try(func() {
		page := b.MustPage(authCodeURL)

		for {
			e := &proto.PageFrameNavigated{}
			wait := page.WaitEvent(e)
			wait()
			if strings.HasPrefix(e.Frame.UnreachableURL, redirectURI) {
				u, _ := url.Parse(e.Frame.UnreachableURL)
				code = u.Query().Get("code")
				break
			}
		}
	})
	testingutil.Expect(t, err, testingutil.Be[error](nil))

	return code
}
