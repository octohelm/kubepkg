package group

import (
	"context"

	"github.com/octohelm/courier/pkg/courierhttp"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
)

type DelGroup struct {
	courierhttp.MethodDelete `path:"/groups/:groupName"`
	GroupName                string `name:"groupName" in:"path"`
}

func (p *DelGroup) Output(ctx context.Context) (any, error) {
	return nil, grouprepository.NewGroupRepository().Delete(ctx, p.GroupName)
}
