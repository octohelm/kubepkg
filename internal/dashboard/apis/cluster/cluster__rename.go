package cluster

import (
	"context"

	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	"github.com/octohelm/kubepkg/pkg/rbac"

	"github.com/octohelm/courier/pkg/courierhttp"
	clusterrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/repository"
)

func (RenameCluster) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		rbac.Need(
			authoperator.NeedAdminRole(group.ROLE_TYPE__MEMBER),
		),
	}
}

type RenameCluster struct {
	courierhttp.MethodPut `path:"/clusters/:name/rename/:newName"`
	Name                  string `name:"name" in:"path"`
	NewName               string `name:"newName" in:"path"`
}

func (p *RenameCluster) Output(ctx context.Context) (any, error) {
	return clusterrepository.NewClusterRepository().Rename(ctx, p.Name, p.NewName)
}
