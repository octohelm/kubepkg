package cluster

import (
	"context"

	clusterrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/repository"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/service"

	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	"github.com/octohelm/kubepkg/pkg/rbac"

	"github.com/octohelm/courier/pkg/courierhttp"
)

func (GetClusterStatus) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		rbac.Need(
			authoperator.NeedAdminRole(group.ROLE_TYPE__MEMBER),
		),
	}
}

type GetClusterStatus struct {
	courierhttp.MethodGet `path:"/clusters/:name/status"`
	Name                  string `name:"name" in:"path"`
}

func (p *GetClusterStatus) Output(ctx context.Context) (any, error) {
	c, err := clusterrepository.NewClusterRepository().Get(ctx, p.Name)
	if err != nil {
		return nil, err
	}
	return service.NewClusterService(c).Status(ctx)
}
