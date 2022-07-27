package idgen

import "context"

type contextKey struct{}

func FromContext(ctx context.Context) Gen {
	return ctx.Value(contextKey{}).(Gen)
}

func FromContextAndCast[T ~uint64](ctx context.Context) TypedGen[T] {
	return Cast[T](ctx.Value(contextKey{}).(Gen))
}

func InjectContext(ctx context.Context, gen Gen) context.Context {
	return context.WithValue(ctx, contextKey{}, gen)
}
