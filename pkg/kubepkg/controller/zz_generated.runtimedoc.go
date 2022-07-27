/*
Package controller GENERATED BY gengo:runtimedoc
DON'T EDIT THIS FILE
*/
package controller

// nolint:deadcode,unused
func runtimeDoc(v any, names ...string) ([]string, bool) {
	if c, ok := v.(interface {
		RuntimeDoc(names ...string) ([]string, bool)
	}); ok {
		return c.RuntimeDoc(names...)
	}
	return nil, false
}

func (v ConfigMapReloadReconciler) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Manager":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.Manager, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v HostOptions) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "InternalHost":
			return []string{
				"Cluster hostname or ip for internal access",
			}, true
		case "ExternalHost":
			return []string{
				"Cluster hostname or ip for external access",
			}, true
		case "EnableHttps":
			return []string{
				"https enabled or not",
			}, true
		case "EnableAutoInternalHost":
			return []string{
				"When enabled, all service http 80 will bind internal host",
			}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v KubePkgApplyReconciler) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Manager":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.Manager, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v KubePkgStatusReconciler) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Manager":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.Manager, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v Operator) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "HostOptions":
			return []string{}, true
		case "WatchNamespace":
			return []string{
				"Watch namespace",
			}, true
		case "MetricsAddr":
			return []string{
				"The address the metric endpoint binds to",
			}, true
		case "EnableLeaderElection":
			return []string{
				"Enable leader election for controller manager.",
			}, true

		}
		if doc, ok := runtimeDoc(v.HostOptions, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v SecretReloadReconciler) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Manager":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.Manager, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v ServiceReconciler) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Manager":
			return []string{}, true
		case "HostOptions":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.Manager, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}
