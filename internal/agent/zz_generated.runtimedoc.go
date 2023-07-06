/*
Package agent GENERATED BY gengo:runtimedoc 
DON'T EDIT THIS FILE
*/
package agent

// nolint:deadcode,unused
func runtimeDoc(v any, names ...string) ([]string, bool) {
	if c, ok := v.(interface {
		RuntimeDoc(names ...string) ([]string, bool)
	}); ok {
		return c.RuntimeDoc(names...)
	}
	return nil, false
}

func (v AgentInfo) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "AgentID":
			return []string{}, true
		case "Version":
			return []string{}, true
		case "SupportedPlatforms":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v Server) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Storage":
			return []string{}, true
		case "RemoteRegistry":
			return []string{}, true
		case "Public":
			return []string{}, true
		case "Server":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.Server, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}
