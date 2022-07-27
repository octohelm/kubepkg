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
	return grouprepository.NewGroupEnvRepository(operator.GroupContext.From(ctx)).List(ctx, nil)
}
