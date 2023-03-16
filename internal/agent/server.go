package agent

import (
	"compress/gzip"
	"context"
	"fmt"
	"net/http"
	"runtime"

	"github.com/go-courier/logr"
	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/innoai-tech/infra/pkg/configuration"
	"github.com/innoai-tech/infra/pkg/http/middleware"
	"github.com/octohelm/courier/pkg/courierhttp/handler"
	"github.com/octohelm/courier/pkg/courierhttp/handler/httprouter"
	"github.com/octohelm/kubepkg/internal/agent/apis"
	"github.com/octohelm/kubepkg/pkg/containerregistry"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)

type Server struct {
	Storage containerregistry.Storage
	// Server DeploymentSettingID
	AgentID string `flag:",omitempty"`
	// Supported platforms
	Platforms []string `flag:"platform,omitempty"`
	// The address the server endpoint binds to
	AgentAddr string `flag:",omitempty,expose=http"`

	r *kubepkg.Registry
	s *http.Server
	h handler.HandlerMiddleware
}

func (s *Server) ApplyHandler(h handler.HandlerMiddleware) {
	s.h = h
}

func (s *Server) SetDefaults() {
	if s.AgentID == "" {
		s.AgentID = "dev"
	}

	if s.AgentAddr == "" {
		s.AgentAddr = ":32060"
	}

	if s.Platforms == nil {
		s.Platforms = []string{
			"linux/amd64",
			"linux/arm64",
		}
	}
}

func (a *Server) Init(ctx context.Context) error {
	if a.r != nil {
		return nil
	}

	c := containerregistry.Configuration{
		StorageRoot: a.Storage.Root,
	}

	cr, err := c.New(ctx)
	if err != nil {
		return err
	}

	a.r = kubepkg.NewRegistry(cr, c.MustStorage())

	if a.s == nil {
		info := cli.InfoFromContext(ctx)

		h, err := httprouter.New(
			apis.R,
			fmt.Sprintf("%s-agent@%s", info.App.Name, info.App.Version),
			middleware.ContextInjectorMiddleware(configuration.ContextInjectorFromContext(ctx)),
			middleware.LogHandler(),
		)
		if err != nil {
			return err
		}

		h = handler.ApplyHandlerMiddlewares(
			agentMetaHandlerMiddleware(info.App.Version, a),
			middleware.HealthCheckHandler(),
			middleware.CompressLevelHandlerMiddleware(gzip.DefaultCompression),
			middleware.DefaultCORS(),
		)(h)

		if a.h != nil {
			h = a.h(h)
		}

		a.s = &http.Server{
			Addr:    a.AgentAddr,
			Handler: h2c.NewHandler(h, &http2.Server{}),
		}
	}

	return nil
}

func (a *Server) InjectContext(ctx context.Context) context.Context {
	return kubepkg.ContextWithRegistry(ctx, a.r)
}

func (a *Server) Serve(ctx context.Context) error {
	if a.s == nil {
		return nil
	}
	logr.FromContext(ctx).Info("agent serve on %s (%s/%s)", a.s.Addr, runtime.GOOS, runtime.GOARCH)
	return a.s.ListenAndServe()
}

func (a *Server) Shutdown(ctx context.Context) error {
	return a.s.Shutdown(ctx)
}
