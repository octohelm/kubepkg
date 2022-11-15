package operator

import (
	"context"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/courier/pkg/expression"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
	"github.com/octohelm/kubepkg/pkg/ioutil"
	"github.com/octohelm/kubepkg/pkg/ioutil/fp"
	"github.com/octohelm/storage/pkg/sqlbuilder"
)

type ValidGroup struct {
	courierhttp.Method `path:"/groups/:groupName"`
	GroupName          string `name:"groupName" in:"path"`
}

func (p *ValidGroup) Output(ctx context.Context) (any, error) {
	g, err := grouprepository.NewGroupRepository().Get(ctx, p.GroupName)
	if err != nil {
		return nil, err
	}

	g2 := &GroupC{Group: g}
	if err := g2.Init(ctx); err != nil {
		return nil, err
	}
	return g2, nil
}

type GroupC struct {
	*group.Group
	CurrentAccountRoleType group.RoleType
}

func (g *GroupC) Init(ctx context.Context) error {
	a := authoperator.AccountContext.From(ctx)

	list, err := grouprepository.NewGroupAccountRepository(g.Group).List(ctx, group.AccountT.AccountID.V(sqlbuilder.Eq(a.AccountID)))
	if err != nil {
		return err
	}

	if len(list) > 0 {
		g.CurrentAccountRoleType = list[0].RoleType
	}

	return nil
}

func (g *GroupC) InjectContext(ctx context.Context) context.Context {
	parent := expression.ValueGetterFromContext(ctx)

	return fp.Pipe2(
		ctx,
		fp.CurryRight2(GroupContext.With)(g.Group),
		fp.CurryRight2(expression.WithValueGetter)(expression.ValueGetterFunc(func(name string) (any, bool) {
			if name == "groupRole" {
				return g.CurrentAccountRoleType.String(), true
			}
			return parent.Get(name)
		})),
	)
}

var GroupContext = ioutil.ContextFor[*group.Group](nil)
