/*
Package kubepkg GENERATED BY gengo:runtimedoc
DON'T EDIT THIS FILE
*/
package kubepkg

// nolint:deadcode,unused
func runtimeDoc(v any, names ...string) ([]string, bool) {
	if c, ok := v.(interface {
		RuntimeDoc(names ...string) ([]string, bool)
	}); ok {
		return c.RuntimeDoc(names...)
	}
	return nil, false
}

func (v DigestResolver) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Namespace":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.Namespace, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v Packer) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Namespace":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.Namespace, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v Progress) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Total":
			return []string{}, true
		case "Complete":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}