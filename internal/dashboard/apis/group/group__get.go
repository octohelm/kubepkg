package group

import (
	"context"

	"github.com/octohelm/courier/pkg/courierhttp"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
)

type GetGroup struct {
	courierhttp.MethodGet `path:"/groups/:groupName"`
	GroupName             string `name:"groupName" in:"path"`
}

func (p *GetGroup) Output(ctx context.Context) (any, error) {
	return grouprepository.NewGroupRepository().Get(ctx, p.GroupName)
}
