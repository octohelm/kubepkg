package user

import (
	"context"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/pkg/rbac"
)

type CurrentPermissions struct {
	courierhttp.MethodGet `path:"/permissions"`
}

func (p *CurrentPermissions) Output(ctx context.Context) (interface{}, error) {
	return rbac.PermissionsFromContext(ctx), nil
}
