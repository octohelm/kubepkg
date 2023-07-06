package containerregistry

import (
	"context"
	"net/http"
	"runtime"

	containerregistryclient "github.com/octohelm/kubepkg/pkg/containerregistry/client"

	"github.com/distribution/distribution/v3"
	"github.com/distribution/distribution/v3/configuration"
	"github.com/distribution/distribution/v3/registry/handlers"
	regsitrymiddleware "github.com/distribution/distribution/v3/registry/middleware/registry"
	"github.com/distribution/distribution/v3/registry/storage/driver"
	"github.com/go-courier/logr"
	infraconfiguration "github.com/innoai-tech/infra/pkg/configuration"
	"github.com/innoai-tech/infra/pkg/http/middleware"
	"github.com/octohelm/courier/pkg/courierhttp/handler"
)

type RemoteRegistry = containerregistryclient.RemoteRegistry

type Server struct {
	Storage Storage

	RemoteRegistry RemoteRegistry
	// The address the server endpoint binds to
	RegistryAddr string `flag:",omitempty,expose=http"`

	s *http.Server
}

func (s *Server) SetDefaults() {
	if s.RegistryAddr == "" {
		s.RegistryAddr = ":5000"
	}
}

func (s *Server) Init(ctx context.Context) error {
	if s.s != nil {
		return nil
	}

	c := &Configuration{}

	c.StorageRoot = s.Storage.Root
	c.RegistryAddr = s.RegistryAddr

	if s.RemoteRegistry.Endpoint != "" {
		c.Proxy = &Proxy{
			RemoteURL: s.RemoteRegistry.Endpoint,
			Username:  s.RemoteRegistry.Username,
			Password:  s.RemoteRegistry.Password,
		}
	}

	cr, err := c.New(ctx)
	if err != nil {
		return err
	}

	_ = regsitrymiddleware.Register("custom", func(ctx context.Context, registry distribution.Namespace, driver driver.StorageDriver, options map[string]interface{}) (distribution.Namespace, error) {
		return cr, nil
	})

	app := handlers.NewApp(ctx, &configuration.Configuration{
		Storage: configuration.Storage{"filesystem": map[string]any{
			"rootdirectory": c.StorageRoot,
		}},
		Middleware: map[string][]configuration.Middleware{
			"registry": {
				{Name: "custom"},
			},
		},
	})

	svc := &http.Server{}

	svc.Addr = c.RegistryAddr
	svc.Handler = handler.ApplyHandlerMiddlewares(
		middleware.HealthCheckHandler(),
		middleware.ContextInjectorMiddleware(infraconfiguration.ContextInjectorFromContext(ctx)),
		middleware.LogAndMetricHandler(),
		enableMirrors,
	)(app)

	s.s = svc

	return nil
}

func (s *Server) Serve(ctx context.Context) error {
	if s.s == nil {
		return nil
	}
	l := logr.FromContext(ctx)

	l.Info("container registry serve on %s (%s/%s)", s.s.Addr, runtime.GOOS, runtime.GOARCH)
	if s.RemoteRegistry.Endpoint != "" {
		l.Info("proxy fallback %s enabled", s.RemoteRegistry.Endpoint)
	}
	return s.s.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	return s.s.Shutdown(ctx)
}
