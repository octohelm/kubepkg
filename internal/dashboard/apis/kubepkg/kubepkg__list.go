package kubepkg

import (
	"context"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg"
	kubepkgrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg/repository"
)

func (ListKubepkg) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroup{},
	}
}

type ListKubepkg struct {
	courierhttp.MethodGet `path:"/kubepkgs"`
	kubepkg.KubepkgQueryParams
}

func (p *ListKubepkg) Output(ctx context.Context) (any, error) {
	g := operator.GroupContext.From(ctx)

	kr := kubepkgrepository.NewKubepkgRepository()

	return kr.List(ctx,
		g.Name,
		p.KubepkgQueryParams,
	)
}
