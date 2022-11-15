package group

import (
	"context"
	"net/http"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"
	clusterrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/repository"
	clusterservice "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/service"
)

func (GetGroupEnvClusterStatus) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroupEnv{},
	}
}

type GetGroupEnvClusterStatus struct {
	courierhttp.MethodGet `path:"/cluster/status"`
}

func (p *GetGroupEnvClusterStatus) Output(ctx context.Context) (any, error) {
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

	return clusterservice.NewClusterService(c).Status(ctx)
}
