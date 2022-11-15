package group

import (
	"context"
	"fmt"
	"time"

	"github.com/octohelm/courier/pkg/expression"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
	"github.com/octohelm/kubepkg/pkg/rbac"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/account/service"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
	"github.com/octohelm/kubepkg/pkg/auth"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"
)

func (RefreshGroupRobotToken) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroup{},
		rbac.Need(expression.AnyOf(
			authoperator.NeedAdminRole(group.ROLE_TYPE__MEMBER),
			authoperator.NeedGroupRole(group.ROLE_TYPE__OWNER),
		)),
	}
}

type RefreshGroupRobotToken struct {
	courierhttp.MethodPut      `path:"/robots/:robotID/tokens"`
	RobotID                    account.ID `name:"robotID" in:"path"`
	RefreshGroupRobotTokenData `in:"body"`
}

type RefreshGroupRobotTokenData struct {
	group.RoleInfo
	// 秒
	ExpiresIn int `json:"expiresIn"`
}

func (p *RefreshGroupRobotToken) Output(ctx context.Context) (any, error) {
	gar := grouprepository.NewGroupAccountRepository(operator.GroupContext.From(ctx))

	if _, err := gar.Put(ctx, group.ROLE_TYPE__MEMBER, p.RobotID); err != nil {
		return nil, err
	}

	ats := service.NewAccessTokenService(&account.Account{
		AccountID:   p.RobotID,
		AccountType: account.TYPE__ROBOT,
	})

	accessToken, err := ats.Sign(ctx, fmt.Sprintf("access token of %s", p.RobotID.String()), time.Duration(p.ExpiresIn)*time.Second)

	if err != nil {
		return nil, err
	}

	return &auth.Token{
		Type:        "bearer",
		AccessToken: accessToken,
	}, nil
}
