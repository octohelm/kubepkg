package group

import (
	"context"

	"github.com/octohelm/courier/pkg/expression"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	"github.com/octohelm/kubepkg/pkg/rbac"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"
	groupservice "github.com/octohelm/kubepkg/internal/dashboard/domain/group/service"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
)

func (PutGroupEnvDeployment) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroupEnv{},

		rbac.Need(expression.AnyOf(
			authoperator.NeedGroupRole(group.ROLE_TYPE__MEMBER),
		)),
	}
}

type PutGroupEnvDeployment struct {
	courierhttp.MethodPut `path:"/deployments"`

	KubePkg *v1alpha1.KubePkg `in:"body"`
}

func (p *PutGroupEnvDeployment) Output(ctx context.Context) (any, error) {
	groupEnv := operator.GroupEnvContext.From(ctx)
	ges := groupservice.NewGroupEnvDeploymentService(groupEnv.Group, groupEnv.Env)
	return ges.PutKubePkg(ctx, p.KubePkg)
}
