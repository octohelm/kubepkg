/*
Package manifest GENERATED BY gengo:runtimedoc
DON'T EDIT THIS FILE
*/
package manifest

// nolint:deadcode,unused
func runtimeDoc(v any, names ...string) ([]string, bool) {
	if c, ok := v.(interface {
		RuntimeDoc(names ...string) ([]string, bool)
	}); ok {
		return c.RuntimeDoc(names...)
	}
	return nil, false
}

func (v CompleteOption) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "AutoIngress":
			return []string{
				"AutoIngress",
				"base host or path mod",
			}, true

		}

		return nil, false
	}
	return []string{}, true
}
