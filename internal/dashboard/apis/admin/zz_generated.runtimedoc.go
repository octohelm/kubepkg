/*
Package admin GENERATED BY gengo:runtimedoc
DON'T EDIT THIS FILE
*/
package admin

// nolint:deadcode,unused
func runtimeDoc(v any, names ...string) ([]string, bool) {
	if c, ok := v.(interface {
		RuntimeDoc(names ...string) ([]string, bool)
	}); ok {
		return c.RuntimeDoc(names...)
	}
	return nil, false
}

func (v DeleteAdminAccount) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "AccountID":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v ListAccount) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "UserQueryParams":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.UserQueryParams, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v ListAdminAccount) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "UserQueryParams":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.UserQueryParams, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v PutAdminAccount) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "AccountID":
			return []string{}, true
		case "RoleInfo":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.RoleInfo, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}
