package user

import (
	"context"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
	"github.com/octohelm/storage/pkg/sqlbuilder"

	accountrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/account/repository"

	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"

	"github.com/octohelm/courier/pkg/courierhttp"
)

type CurrentUser struct {
	courierhttp.MethodGet
}

func (*CurrentUser) Output(ctx context.Context) (any, error) {
	a := authoperator.AccountContext.From(ctx)

	ar := accountrepository.NewAccountRepository()

	user, err := ar.GetUser(ctx, a.AccountID)
	if err != nil {
		return nil, err
	}

	a.User = *user

	a.GroupRoles = map[group.ID]group.RoleType{}

	gr := grouprepository.NewGroupRepository()

	where := sqlbuilder.And(
		group.AccountT.AccountID.V(sqlbuilder.Eq(a.AccountID)),
		group.AccountT.GroupID.V(sqlbuilder.Neq(grouprepository.AdminGroupID)),
	)

	if err := gr.RangeGroupAccount(ctx, where, func(ga *group.Account) error {
		a.GroupRoles[ga.GroupID] = ga.RoleType
		return nil
	}); err != nil {
		return nil, err
	}

	return a, nil
}
