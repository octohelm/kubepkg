package operator

import (
	"context"
	"testing"

	"github.com/octohelm/courier/pkg/expression"
	"github.com/octohelm/kubepkg/internal/testingutil"
	"github.com/octohelm/kubepkg/pkg/rbac"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
)

func TestAccessRule(t *testing.T) {
	x := rbac.Need(
		NeedAdminRole(group.ROLE_TYPE__MEMBER),
	)

	t.Run("ADMIN should pass", func(t *testing.T) {
		ctx := expression.WithValueGetter(context.Background(), expression.ValueGetterFunc(func(name string) (any, bool) {
			switch name {
			case "adminRole":
				return group.ROLE_TYPE__ADMIN, true
			}
			return "", false
		}))

		testingutil.Expect(t, x.CanAccess(ctx), testingutil.Be(true))
	})

	t.Run("GUEST should failed", func(t *testing.T) {
		ctx := expression.WithValueGetter(context.Background(), expression.ValueGetterFunc(func(name string) (any, bool) {
			switch name {
			case "adminRole":
				return group.ROLE_TYPE__GUEST, true
			}
			return "", false
		}))

		testingutil.Expect(t, x.CanAccess(ctx), testingutil.Be(false))
	})
}
