package group

import (
	"context"

	"github.com/octohelm/kubepkg/pkg/kubepkg/specutil"

	"github.com/octohelm/courier/pkg/expression"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	"github.com/octohelm/kubepkg/pkg/rbac"

	groupservice "github.com/octohelm/kubepkg/internal/dashboard/domain/group/service"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group/operator"
	"github.com/octohelm/kubepkg/pkg/datatypes"
)

func (ListGroupEnvDeployment) MiddleOperators() courier.MiddleOperators {
	return courier.MiddleOperators{
		&operator.ValidGroupEnv{},

		rbac.Need(expression.AnyOf(
			authoperator.NeedGroupRole(group.ROLE_TYPE__MEMBER),
		)),
	}
}

type ListGroupEnvDeployment struct {
	courierhttp.MethodGet `path:"/deployments"`
	Raw                   bool `name:"raw,omitempty" in:"query"`
	datatypes.Pager
}

func (p *ListGroupEnvDeployment) Output(ctx context.Context) (any, error) {
	groupEnv := operator.GroupEnvContext.From(ctx)
	s := groupservice.NewGroupEnvDeploymentService(groupEnv.Group, &groupEnv.Env)

	list, err := s.ListKubePkg(ctx, &p.Pager)
	if err != nil {
		return nil, err
	}

	if p.Raw {
		return list, nil
	}

	for i := range list.Items {
		kpkg, err := specutil.ApplyOverwrites(&list.Items[i])
		if err == nil {
			list.Items[i] = *kpkg
		}
	}

	return list, nil
}
