package ioutil

import (
	"context"

	contextx "github.com/octohelm/x/context"
)

func ContextFor[T any](defaultValue T) ContextOperator[T] {
	return &contextOperator[T]{defaultValue: defaultValue}
}

type ContextOperator[T any] interface {
	From(ctx context.Context) T
	With(ctx context.Context, a T) context.Context
}

type contextOperator[T any] struct {
	defaultValue T
}

type contextKey[T any] struct{}

func (o *contextOperator[T]) From(ctx context.Context) T {
	if a, ok := ctx.Value(contextKey[T]{}).(T); ok {
		return a
	}
	return o.defaultValue
}

func (contextOperator[T]) With(ctx context.Context, a T) context.Context {
	return contextx.WithValue(ctx, contextKey[T]{}, a)
}
