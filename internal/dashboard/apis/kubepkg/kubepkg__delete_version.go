package kubepkg

import (
	"context"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/expression"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	"github.com/octohelm/kubepkg/pkg/rbac"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg"
	kubepkgrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg/repository"
)

func (DeleteKubepkgVersion) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroup{},
		rbac.Need(expression.AnyOf(
			authoperator.NeedGroupRole(group.ROLE_TYPE__OWNER),
		)),
	}
}

type DeleteKubepkgVersion struct {
	courierhttp.MethodDelete `path:"/kubepkgs/:name/:channel/versions/:version"`
	Name                     string          `name:"name"  in:"path"`
	Channel                  kubepkg.Channel `name:"channel"  in:"path"`
	Version                  string          `name:"version"  in:"path"`
}

func (p *DeleteKubepkgVersion) Output(ctx context.Context) (any, error) {
	g := operator.GroupContext.From(ctx)
	kr := kubepkgrepository.NewKubepkgRepository()

	return nil, kr.DeleteVersion(ctx, g.Name, p.Name, p.Channel, p.Version)
}
