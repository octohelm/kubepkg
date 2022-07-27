package main

import (
	"net/http"
	"strings"

	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/innoai-tech/infra/pkg/otel"
	webappagent "github.com/octohelm/kubepkg/cmd/kubepkg/webapp/agent"
	"github.com/octohelm/kubepkg/internal/agent"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
)

func init() {
	s := cli.AddTo(Serve, &Agent{})

	s.ApplyHandler(func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
			if strings.HasPrefix(req.URL.Path, "/api/") {
				h.ServeHTTP(rw, req)
				return
			}
			webappagent.WebUI.ServeHTTP(rw, req)
		})
	})
}

// Serve kubepkg agent
type Agent struct {
	cli.C `component:"kubepkg-agent"`
	otel.Otel
	kubeutil.KubeClient
	agent.Server
}
