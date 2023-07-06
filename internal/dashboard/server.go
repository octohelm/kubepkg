package dashboard

import (
	"context"

	"github.com/innoai-tech/infra/pkg/configuration"
	infrahttp "github.com/innoai-tech/infra/pkg/http"
	"github.com/octohelm/kubepkg/internal/dashboard/apis"
	"github.com/octohelm/kubepkg/pkg/rbac"
	"github.com/octohelm/kubepkg/pkg/serverinfo"
)

var permissions = rbac.PermissionsFromRouter("dashboard", apis.R)

type Server struct {
	infrahttp.Server
	Public serverinfo.Public
}

func (s *Server) Init(ctx context.Context) error {
	if err := s.Public.InitWithAddr(s.Server.Addr); err != nil {
		return err
	}

	s.ApplyRouter(apis.R)

	if err := s.Public.ApplyRouter(apis.R); err != nil {
		return err
	}
	return s.Server.Init(ctx)
}

func (s *Server) InjectContext(ctx context.Context) context.Context {
	return configuration.InjectContext(
		ctx,
		configuration.InjectContextFunc(rbac.WithPermissions, permissions),
		configuration.InjectContextFunc(serverinfo.EndpointProviderWithContext, serverinfo.EndpointProvider(&s.Public)),
	)
}
