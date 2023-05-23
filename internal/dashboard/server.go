package dashboard

import (
	"context"

	"github.com/innoai-tech/infra/pkg/http"
	"github.com/octohelm/kubepkg/internal/dashboard/apis"
	"github.com/octohelm/kubepkg/pkg/rbac"
)

var permissions = rbac.PermissionsFromRouter("dashboard", apis.R)

type Server struct {
	http.Server
}

func (s *Server) Init(ctx context.Context) error {
	s.ApplyRouter(apis.R)
	return s.Server.Init(ctx)
}

func (s *Server) InjectContext(ctx context.Context) context.Context {
	return rbac.WithPermissions(ctx, permissions)
}
