/*
Package cluster GENERATED BY gengo:runtimedoc
DON'T EDIT THIS FILE
*/
package cluster

// nolint:deadcode,unused
func runtimeDoc(v any, names ...string) ([]string, bool) {
	if c, ok := v.(interface {
		RuntimeDoc(names ...string) ([]string, bool)
	}); ok {
		return c.RuntimeDoc(names...)
	}
	return nil, false
}

func (v Cluster) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "ID":
			return []string{
				"集群 ID",
			}, true
		case "Name":
			return []string{
				"集群名称",
			}, true
		case "Info":
			return []string{}, true
		case "CreationUpdationDeletionTime":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.Info, names...); ok {
			return doc, ok
		}
		if doc, ok := runtimeDoc(v.CreationUpdationDeletionTime, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (EnvType) RuntimeDoc(names ...string) ([]string, bool) {
	return []string{}, true
}
func (ID) RuntimeDoc(names ...string) ([]string, bool) {
	return []string{}, true
}
func (v Info) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Desc":
			return []string{
				"集群描述",
			}, true
		case "EnvType":
			return []string{
				"集群环境类型",
			}, true
		case "NetType":
			return []string{
				"网络环境",
				"validate: string(required(),oneOf(['DIRECT','AIRGAP']))",
			}, true
		case "Endpoint":
			return []string{
				"Agent 地址",
				"validate: when('netType',is('DIRECT'),then(string(required())))",
			}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v InstanceStatus) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "ID":
			return []string{}, true
		case "Ping":
			return []string{}, true
		case "SupportedPlatforms":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (NetType) RuntimeDoc(names ...string) ([]string, bool) {
	return []string{}, true
}
func (Status) RuntimeDoc(names ...string) ([]string, bool) {
	return []string{}, true
}
