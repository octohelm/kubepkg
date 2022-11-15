package group

import (
	"context"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"

	"github.com/octohelm/courier/pkg/courierhttp"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
)

func (ListGroupEnv) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroup{},
	}
}

type ListGroupEnv struct {
	courierhttp.MethodGet `path:"/envs"`
}

func (p *ListGroupEnv) Output(ctx context.Context) (any, error) {
	g := operator.GroupContext.From(ctx)
	return grouprepository.NewGroupEnvRepository(g).List(ctx, nil)
}
