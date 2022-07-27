package group

import (
	"context"

	"github.com/octohelm/courier/pkg/courierhttp"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
)

type ListGroup struct {
	courierhttp.MethodGet `path:"/groups"`
}

func (p *ListGroup) Output(ctx context.Context) (any, error) {
	return grouprepository.NewGroupRepository().List(ctx, nil)
}
