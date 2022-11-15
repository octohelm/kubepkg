/*
Package vault GENERATED BY gengo:runtimedoc
DON'T EDIT THIS FILE
*/
package vault

// nolint:deadcode,unused
func runtimeDoc(v any, names ...string) ([]string, bool) {
	if c, ok := v.(interface {
		RuntimeDoc(names ...string) ([]string, bool)
	}); ok {
		return c.RuntimeDoc(names...)
	}
	return nil, false
}

func (v CipherData) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "CipherOpt":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.CipherOpt, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v CipherOpt) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Alg":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v Seed) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Password":
			return []string{}, true
		case "Salt":
			return []string{}, true
		case "Count":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}