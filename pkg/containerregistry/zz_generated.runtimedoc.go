/*
Package containerregistry GENERATED BY gengo:runtimedoc 
DON'T EDIT THIS FILE
*/
package containerregistry

// nolint:deadcode,unused
func runtimeDoc(v any, names ...string) ([]string, bool) {
	if c, ok := v.(interface {
		RuntimeDoc(names ...string) ([]string, bool)
	}); ok {
		return c.RuntimeDoc(names...)
	}
	return nil, false
}

func (v Configuration) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "StorageRoot":
			return []string{}, true
		case "RegistryAddr":
			return []string{}, true
		case "RegistryBaseHost":
			return []string{}, true
		case "Proxy":
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
		case "RegistryAddr":
			return []string{
				"The address the server endpoint binds to",
			}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v Storage) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Root":
			return []string{
				"Storage dir root",
			}, true

		}

		return nil, false
	}
	return []string{}, true
}
