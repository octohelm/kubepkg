package group

import (
	"context"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"

	accountrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/account/repository"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"

	"github.com/octohelm/courier/pkg/courierhttp"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
)

func (ListGroupAccount) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroup{},
	}
}

type ListGroupAccount struct {
	courierhttp.MethodGet `path:"/accounts"`
	group.UserQueryParams
}

func (p *ListGroupAccount) Output(ctx context.Context) (any, error) {
	gar := grouprepository.NewGroupAccountRepository(operator.GroupContext.From(ctx))

	return gar.ListAccountUser(
		ctx,
		p.UserQueryParams,
		accountrepository.NewAccountRepository().RangeIdentity,
	)
}
