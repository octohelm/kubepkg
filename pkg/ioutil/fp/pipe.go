package fp

func Pipe1[T1, R any](t1 T1, fn1 func(T1) R) R {
	return fn1(t1)
}

func Pipe2[T1, T2, R any](t1 T1, fn1 func(T1) T2, fn2 func(T2) R) R {
	return fn2(fn1(t1))
}

func Pipe3[T1, T2, T3, R any](t1 T1, fn1 func(T1) T2, fn2 func(T2) T3, fn3 func(T3) R) R {
	return fn3(fn2(fn1(t1)))
}
