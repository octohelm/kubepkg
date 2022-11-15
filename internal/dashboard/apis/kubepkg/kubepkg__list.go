package kubepkg

import (
	"context"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg"
	kubepkgrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg/repository"
	"github.com/octohelm/kubepkg/pkg/datatypes"
	"github.com/octohelm/storage/pkg/sqlbuilder"
)

func (ListKubepkg) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroup{},
	}
}

type ListKubepkg struct {
	courierhttp.MethodGet `path:"/kubepkgs"`
	datatypes.Pager
}

func (p *ListKubepkg) Output(ctx context.Context) (any, error) {
	g := operator.GroupContext.From(ctx)

	kr := kubepkgrepository.NewKubepkgRepository()

	return kr.List(ctx,
		kubepkg.KubepkgT.Group.V(sqlbuilder.Eq(g.Name)),
		&p.Pager,
	)
}
