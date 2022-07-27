package operator

import (
	"context"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
	"github.com/octohelm/kubepkg/pkg/ioutil"
)

type ValidGroup struct {
	courierhttp.Method `path:"/groups/:groupName"`
	GroupName          string `name:"groupName" in:"path"`
}

func (p *ValidGroup) Output(ctx context.Context) (interface{}, error) {
	g, err := grouprepository.NewGroupRepository().Get(ctx, p.GroupName)
	if err != nil {
		return nil, err
	}
	return &Group{Group: g}, nil
}

type Group struct {
	*group.Group
	// TODO added group role
	RoleType group.RoleType
}

func (g *Group) InjectContext(ctx context.Context) context.Context {
	return GroupContext.With(ctx, g.Group)
}

var GroupContext = ioutil.ContextFor[*group.Group](nil)
