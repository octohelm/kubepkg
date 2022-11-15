/*
Package group GENERATED BY gengo:runtimedoc
DON'T EDIT THIS FILE
*/
package group

// nolint:deadcode,unused
func runtimeDoc(v any, names ...string) ([]string, bool) {
	if c, ok := v.(interface {
		RuntimeDoc(names ...string) ([]string, bool)
	}); ok {
		return c.RuntimeDoc(names...)
	}
	return nil, false
}

func (v CreateGroupRobot) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "RobotInfo":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.RobotInfo, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v DeleteGroupAccount) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "AccountID":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v GetGroup) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "GroupName":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v ListGroup) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {

		}

		return nil, false
	}
	return []string{}, true
}

func (v ListGroupAccount) RuntimeDoc(names ...string) ([]string, bool) {
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

func (v ListGroupEnv) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {

		}

		return nil, false
	}
	return []string{}, true
}

func (v ListGroupEnvDeployment) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Pager":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.Pager, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v ListGroupRobot) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "RobotQueryParams":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.RobotQueryParams, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v PutGroup) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "GroupName":
			return []string{}, true
		case "Info":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v PutGroupAccount) RuntimeDoc(names ...string) ([]string, bool) {
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

func (v PutGroupEnv) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "EnvName":
			return []string{}, true
		case "Info":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v PutGroupEnvDeployment) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "KubePkg":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v RefreshGroupRobotToken) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "RobotID":
			return []string{}, true
		case "RefreshGroupRobotTokenData":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.RefreshGroupRobotTokenData, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v RefreshGroupRobotTokenData) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "RoleInfo":
			return []string{}, true
		case "ExpiresIn":
			return []string{
				"秒",
			}, true

		}
		if doc, ok := runtimeDoc(v.RoleInfo, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}
