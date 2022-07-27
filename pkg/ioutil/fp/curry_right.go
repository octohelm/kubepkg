package fp

func CurryRight2[T1, T2, R any](fn func(T1, T2) R) func(t2 T2) func(t1 T1) R {
	return func(t2 T2) func(t1 T1) R {
		return func(t1 T1) R {
			return fn(t1, t2)
		}
	}
}
