package rbac

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/expression"
	"github.com/octohelm/courier/pkg/statuserror"
)

func Need(rule expression.Expression) *NeedAccessRule {
	expr, err := expression.From(rule)
	if err != nil {
		panic(err)
	}
	return &NeedAccessRule{expr: expr, rule: rule}
}

type NeedAccessRule struct {
	expr expression.Expr
	rule expression.Expression
}

func (n *NeedAccessRule) String() string {
	return fmt.Sprintf("auth.Need(%s)", expression.Stringify(n.rule))
}

func (n *NeedAccessRule) InitFrom(o courier.Operator) {
	n.expr = o.(*NeedAccessRule).expr
}

func (n *NeedAccessRule) Output(ctx context.Context) (any, error) {
	if n.CanAccess(ctx) {
		return nil, nil
	}
	return nil, statuserror.Wrap(
		errors.New("没有访问权限"),
		http.StatusForbidden,
		"PermissionDenied",
	)
}
func (n *NeedAccessRule) CanAccess(ctx context.Context) bool {
	ret, err := n.expr.Exec(ctx, nil)
	if err != nil {
		return false
	}
	if b, ok := ret.(bool); ok {
		return b
	}
	return false
}

func (n *NeedAccessRule) AccessRule() expression.Expression {
	return n.rule
}

type CanAccessRule interface {
	AccessRule() expression.Expression
}
