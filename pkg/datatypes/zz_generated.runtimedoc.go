/*
Package datatypes GENERATED BY gengo:runtimedoc
DON'T EDIT THIS FILE
*/
package datatypes

// nolint:deadcode,unused
func runtimeDoc(v any, names ...string) ([]string, bool) {
	if c, ok := v.(interface {
		RuntimeDoc(names ...string) ([]string, bool)
	}); ok {
		return c.RuntimeDoc(names...)
	}
	return nil, false
}

func (v CreationTime) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {

		}

		return nil, false
	}
	return []string{}, true
}

func (v CreationUpdationDeletionTime) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "CreationUpdationTime":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.CreationUpdationTime, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v CreationUpdationTime) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "CreationTime":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.CreationTime, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v DeprecatedTime) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {

		}

		return nil, false
	}
	return []string{}, true
}

func (v Pager) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Size":
			return []string{}, true
		case "Offset":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v PrimaryID) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "ID":
			return []string{
				"自增 ID",
			}, true

		}

		return nil, false
	}
	return []string{}, true
}
