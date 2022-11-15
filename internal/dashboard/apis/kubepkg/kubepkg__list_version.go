package kubepkg

import (
	"context"

	"github.com/octohelm/kubepkg/pkg/datatypes"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg"
	kubepkgrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg/repository"
)

func (ListKubepkgVersion) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroup{},
	}
}

type ListKubepkgVersion struct {
	courierhttp.MethodGet `path:"/kubepkgs/:name/:channel/versions"`
	Name                  string          `name:"name"  in:"path"`
	Channel               kubepkg.Channel `name:"channel"  in:"path"`
}

func (p *ListKubepkgVersion) Output(ctx context.Context) (any, error) {
	g := operator.GroupContext.From(ctx)
	kr := kubepkgrepository.NewKubepkgRepository()
	return kr.ListVersion(ctx, g.Name, p.Name, p.Channel, nil, &datatypes.Pager{
		Size: -1,
	})
}
