package group

import (
	"context"
	"net/http"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"
	clusterservice "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/service"
)

func (ListGroupEnvClusterDeployments) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroupEnv{},
	}
}

type ListGroupEnvClusterDeployments struct {
	courierhttp.MethodGet `path:"/cluster/deployments"`
}

func (p *ListGroupEnvClusterDeployments) Output(ctx context.Context) (any, error) {
	ge := operator.GroupEnvContext.From(ctx)
	if ge.Cluster == nil || ge.Cluster.Endpoint == "" {
		return nil, statuserror.Wrap(nil, http.StatusForbidden, "NotBindCluster")
	}
	return clusterservice.NewClusterService(ge.Cluster).Deployments(ctx, ge.Namespace)
}
