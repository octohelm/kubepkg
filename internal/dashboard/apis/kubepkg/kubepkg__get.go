package kubepkg

import (
	"context"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg"
	kubepkgrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg/repository"
)

func (GetKubepkgRevision) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroup{},
	}
}

type GetKubepkgRevision struct {
	courierhttp.MethodGet `path:"/kubepkgs/:name/:channel/revisions/:revisionID"`
	Name                  string             `name:"name"  in:"path"`
	Channel               kubepkg.Channel    `name:"channel"  in:"path"`
	RevisionID            kubepkg.RevisionID `name:"revisionID"  in:"path"`
}

func (p *GetKubepkgRevision) Output(ctx context.Context) (any, error) {
	g := operator.GroupContext.From(ctx)

	kr := kubepkgrepository.NewKubepkgRepository()

	return kr.Get(ctx, g.Name, p.Name, p.Channel, p.RevisionID)
}
