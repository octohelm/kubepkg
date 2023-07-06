package agent

import (
	"context"

	"github.com/distribution/distribution/v3"
	"github.com/distribution/distribution/v3/configuration"
	"github.com/distribution/distribution/v3/registry/handlers"
	regsitrymiddleware "github.com/distribution/distribution/v3/registry/middleware/registry"
	"github.com/distribution/distribution/v3/registry/storage/driver"
	infraconfiguration "github.com/innoai-tech/infra/pkg/configuration"
	infrahttp "github.com/innoai-tech/infra/pkg/http"
	"github.com/octohelm/kubepkg/internal/agent/apis"
	"github.com/octohelm/kubepkg/pkg/containerregistry"
	"github.com/octohelm/kubepkg/pkg/serverinfo"
)

type Server struct {
	Storage        containerregistry.Storage
	RemoteRegistry containerregistry.RemoteRegistry

	Public serverinfo.Public

	registry *containerregistry.App

	infrahttp.Server
}

func (s *Server) SetDefaults() {
	if s.Addr == "" {
		s.Addr = ":32060"
	}
}

func (s *Server) Init(ctx context.Context) error {
	if err := s.Public.InitWithAddr(s.Addr); err != nil {
		return err
	}

	s.ApplyRouter(apis.R)
	if err := s.Public.ApplyRouter(apis.R); err != nil {
		return err
	}

	c := containerregistry.Configuration{
		StorageRoot: s.Storage.Root,
	}

	if s.RemoteRegistry.Endpoint != "" {
		c.Proxy = &containerregistry.Proxy{
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

	s.registry = handlers.NewApp(ctx, &configuration.Configuration{
		Storage: configuration.Storage{
			"filesystem": map[string]any{
				"rootdirectory": c.StorageRoot,
			},
		},
		Middleware: map[string][]configuration.Middleware{
			"registry": {
				{
					Name: "custom",
				},
			},
		},
	})

	return s.Server.Init(ctx)
}

func (s *Server) InjectContext(ctx context.Context) context.Context {
	return infraconfiguration.InjectContext(ctx,
		infraconfiguration.InjectContextFunc(containerregistry.ContextWithRegistryApp, s.registry),
		infraconfiguration.InjectContextFunc(serverinfo.EndpointProviderWithContext, serverinfo.EndpointProvider(&s.Public)),
	)
}
