package main

import (
	"net/http"
	"strings"

	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/innoai-tech/infra/pkg/otel"
	webappdashboard "github.com/octohelm/kubepkg/cmd/kubepkg/webapp/dashboard"
	"github.com/octohelm/kubepkg/internal/dashboard"
	"github.com/octohelm/kubepkg/pkg/auth"
	"github.com/octohelm/kubepkg/pkg/idgen"
	"github.com/octohelm/kubepkg/pkg/signer"
)

func init() {
	s := cli.AddTo(Serve, &Dashboard{})

	s.ApplyHandler(func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
			if strings.HasPrefix(req.URL.Path, "/api/") {
				h.ServeHTTP(rw, req)
				return
			}
			webappdashboard.WebUI.ServeHTTP(rw, req)
		})
	})
}

// Serve kubepkg dashboard
type Dashboard struct {
	cli.C `component:"kubepkg-dashboard"`
	otel.Otel
	idgen.IDGen
	Sign             signer.JWTSigner
	Auth             dashboard.AuthProvider
	AuthProviderOidc auth.OIDC
	DB               dashboard.Database
	dashboard.Server
}
