package group

import (
	"context"

	"github.com/octohelm/courier/pkg/expression"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
	"github.com/octohelm/kubepkg/pkg/rbac"

	accountrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/account/repository"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"
)

func (CreateGroupRobot) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroup{},
		rbac.Need(expression.AnyOf(
			authoperator.NeedAdminRole(group.ROLE_TYPE__MEMBER),
			authoperator.NeedGroupRole(group.ROLE_TYPE__OWNER),
		)),
	}
}

type CreateGroupRobot struct {
	courierhttp.MethodPut `path:"/robots"`
	account.RobotInfo     `in:"body"`
}

func (p *CreateGroupRobot) Output(ctx context.Context) (any, error) {
	r, err := accountrepository.NewAccountRepository().PutRobot(ctx, p.RobotInfo, 0)

	if err != nil {
		return nil, err
	}

	gar := grouprepository.NewGroupAccountRepository(operator.GroupContext.From(ctx))
	if _, err := gar.Put(ctx, group.ROLE_TYPE__MEMBER, r.AccountID); err != nil {
		return nil, err
	}

	return r, nil
}
