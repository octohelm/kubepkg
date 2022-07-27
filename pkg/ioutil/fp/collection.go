package fp

func FilterMap[I any, O any](check func(v I) (O, bool)) func(in []I) []O {
	return func(in []I) []O {
		var out = make([]O, 0, len(in))
		for i := range in {
			if ret, ok := check(in[i]); ok {
				out = append(out, ret)
			}
		}
		return out
	}
}

func Filter[I any](check func(v I) bool) func(in []I) []I {
	return func(in []I) []I {
		var out = make([]I, 0, len(in))
		for i := range in {
			if item := in[i]; check(item) {
				out = append(out, item)
			}
		}
		return out
	}
}

func Map[I any, O any](m func(v I) O) func(in []I) []O {
	return func(in []I) []O {
		var out = make([]O, len(in))
		for i := range in {
			out[i] = m(in[i])
		}
		return out
	}
}
