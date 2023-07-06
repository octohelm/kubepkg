/*
Package operator GENERATED BY gengo:runtimedoc 
DON'T EDIT THIS FILE
*/
package operator

// nolint:deadcode,unused
func runtimeDoc(v any, names ...string) ([]string, bool) {
	if c, ok := v.(interface {
		RuntimeDoc(names ...string) ([]string, bool)
	}); ok {
		return c.RuntimeDoc(names...)
	}
	return nil, false
}

func (v GroupC) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Group":
			return []string{}, true
		case "CurrentAccountRoleType":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.Group, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v GroupEnvC) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "GroupC":
			return []string{}, true
		case "EnvWithCluster":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.GroupC, names...); ok {
			return doc, ok
		}
		if doc, ok := runtimeDoc(v.EnvWithCluster, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v ValidGroup) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "GroupName":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v ValidGroupEnv) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "GroupName":
			return []string{}, true
		case "EnvName":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}
