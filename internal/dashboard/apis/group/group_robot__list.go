package group

import (
	"context"

	accountrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/account/repository"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"

	"github.com/octohelm/courier/pkg/courierhttp"
)

func (ListGroupRobot) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroup{},
	}
}

type ListGroupRobot struct {
	courierhttp.MethodGet `path:"/robots"`
	group.RobotQueryParams
}

func (p *ListGroupRobot) Output(ctx context.Context) (any, error) {
	gar := grouprepository.NewGroupAccountRepository(operator.GroupContext.From(ctx))

	return gar.ListAccountRobot(
		ctx,
		p.RobotQueryParams,
		accountrepository.NewAccountRepository().RangeIdentity,
	)
}
