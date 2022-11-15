package group

import (
	"context"
	"net/http"

	"github.com/octohelm/courier/pkg/statuserror"
	clusterrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/repository"
	clusterservice "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/service"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"

	"github.com/octohelm/courier/pkg/courierhttp"
)

func (GetGroupEnvClusterDeployments) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroupEnv{},
	}
}

type GetGroupEnvClusterDeployments struct {
	courierhttp.MethodGet `path:"/cluster/deployments"`
}

func (p *GetGroupEnvClusterDeployments) Output(ctx context.Context) (any, error) {
	gec := operator.GroupEnvContext.From(ctx)
	if gec.ClusterID == 0 {
		return nil, statuserror.Wrap(nil, http.StatusForbidden, "NoClusterBind")
	}
	c, err := clusterrepository.NewClusterRepository().Get(ctx, gec.ClusterID.String())
	if err != nil {
		return nil, err
	}
	if c.Endpoint != "" {
		return nil, statuserror.Wrap(nil, http.StatusForbidden, "NoClusterBind")
	}

	return clusterservice.NewClusterService(c).Deployments(ctx, gec.Namespace)
}
