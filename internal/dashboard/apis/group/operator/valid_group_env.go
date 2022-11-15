package operator

import (
	"context"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
	"github.com/octohelm/kubepkg/pkg/ioutil"
)

type ValidGroupEnv struct {
	courierhttp.Method `path:"/groups/:groupName/envs/:envName"`
	GroupName          string `name:"groupName" in:"path"`
	EnvName            string `name:"envName" in:"path"`
}

func (p *ValidGroupEnv) Output(ctx context.Context) (any, error) {
	g, err := grouprepository.NewGroupRepository().Get(ctx, p.GroupName)
	if err != nil {
		return nil, err
	}

	env, err := grouprepository.NewGroupEnvRepository(g).Get(ctx, p.EnvName)
	if err != nil {
		return nil, err
	}

	g2 := &GroupC{Group: g}
	if err := g2.Init(ctx); err != nil {
		return nil, err
	}

	return &GroupEnvC{EnvWithCluster: env, GroupC: g2}, nil
}

type GroupEnvC struct {
	*GroupC
	*group.EnvWithCluster
}

func (g *GroupEnvC) InjectContext(ctx context.Context) context.Context {
	return GroupEnvContext.With(g.GroupC.InjectContext(ctx), g)
}

var GroupEnvContext = ioutil.ContextFor[*GroupEnvC](nil)
