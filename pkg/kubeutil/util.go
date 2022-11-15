package kubeutil

func Intersection[E comparable](a []E, b []E) (c []E) {

	includes := map[E]bool{}
	for i := range a {
		includes[a[i]] = true
	}

	c = make([]E, 0, len(a)+len(b))
	for i := range b {
		x := b[i]

		if _, ok := includes[x]; ok {
			c = append(c, x)
		}
	}

	return
}

func Union[E comparable](a []E, b []E) (c []E) {
	c = make([]E, 0, len(a)+len(b))
	added := map[E]bool{}

	all := append(a, b...)
	for i := range all {
		x := all[i]

		if _, ok := added[x]; ok {
			continue
		}

		c = append(c, x)
		added[x] = true
	}

	return
}
