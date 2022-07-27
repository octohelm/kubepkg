package operator

import (
	"github.com/octohelm/courier/pkg/expression"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
)

func WhenGroupEnv(envType group.EnvType, then expression.Expression) expression.Expression {
	return expression.When(
		expression.Pipe(expression.Get("envType"), expression.Eq(envType.String())),
		then,
	)
}

func NeedAdminRole(roleTypeAndHigher group.RoleType) expression.Expression {
	roleTypes := allowedRoleTypeStrings(roleTypeAndHigher)

	return expression.Pipe(
		expression.Get("adminRole"),
		expression.OneOf(roleTypes...),
	)
}

func NeedGroupRole(roleTypeAndHigher group.RoleType) expression.Expression {
	roleTypes := allowedRoleTypeStrings(roleTypeAndHigher)

	return expression.Pipe(
		expression.Get("groupRole"),
		expression.OneOf(roleTypes...),
	)
}

func allowedRoleTypeStrings(roleTypeAndHigher group.RoleType) []any {
	values := group.ROLE_TYPE_UNKNOWN.EnumValues()

	roleTypes := make([]any, 0, len(values))
	for _, v := range values {
		rt := v.(group.RoleType)
		if rt <= roleTypeAndHigher {
			roleTypes = append(roleTypes, rt.String())
		}
	}
	return roleTypes
}
