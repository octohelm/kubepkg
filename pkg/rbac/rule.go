package rbac

import (
	"context"
	"fmt"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/expression"
)

type contextPermissions struct{}

type Permissions map[string]expression.Expression

func WithPermissions(ctx context.Context, cs Permissions) context.Context {
	return context.WithValue(ctx, contextPermissions{}, cs)
}

func PermissionsFromContext(ctx context.Context) Permissions {
	return ctx.Value(contextPermissions{}).(Permissions)
}

func PermissionsFromRouter(serviceName string, router courier.Router) Permissions {
	permissions := Permissions{}

	for _, r := range router.Routes() {
		var operationID = ""
		var ex expression.Expression

		_ = r.RangeOperator(func(f *courier.OperatorFactory, i int) error {
			if canAccessRule, ok := f.Operator.(CanAccessRule); ok {
				ex = canAccessRule.AccessRule()
			}
			if f.IsLast {
				operationID = f.Type.Name()
			}
			return nil
		})

		if ex != nil {
			permissions[fmt.Sprintf("%s.%s", serviceName, operationID)] = ex
		}
	}

	return permissions
}
