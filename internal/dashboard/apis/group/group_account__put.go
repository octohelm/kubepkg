package group

import (
	"context"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"

	"github.com/octohelm/courier/pkg/courierhttp"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
)

func (PutGroupAccount) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroup{},
	}
}

type PutGroupAccount struct {
	courierhttp.MethodPut `path:"/accounts/:accountID"`
	AccountID             account.ID `name:"accountID" in:"path"`
	group.RoleInfo        `in:"body"`
}

func (p *PutGroupAccount) Output(ctx context.Context) (any, error) {
	gar := grouprepository.NewGroupAccountRepository(operator.GroupContext.From(ctx))

	return gar.Put(
		ctx,
		p.RoleType,
		p.AccountID,
	)
}
