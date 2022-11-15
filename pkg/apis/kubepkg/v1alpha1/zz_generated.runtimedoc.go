/*
Package v1alpha1 GENERATED BY gengo:runtimedoc
DON'T EDIT THIS FILE
*/
package v1alpha1

// nolint:deadcode,unused
func runtimeDoc(v any, names ...string) ([]string, bool) {
	if c, ok := v.(interface {
		RuntimeDoc(names ...string) ([]string, bool)
	}); ok {
		return c.RuntimeDoc(names...)
	}
	return nil, false
}

func (v Container) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Image":
			return []string{}, true
		case "WorkingDir":
			return []string{}, true
		case "Command":
			return []string{}, true
		case "Args":
			return []string{}, true
		case "Env":
			return []string{}, true
		case "Ports":
			return []string{
				"Ports: [PortName]: ContainerPort",
			}, true
		case "Stdin":
			return []string{}, true
		case "StdinOnce":
			return []string{}, true
		case "TTY":
			return []string{}, true
		case "Resources":
			return []string{}, true
		case "LivenessProbe":
			return []string{}, true
		case "ReadinessProbe":
			return []string{}, true
		case "StartupProbe":
			return []string{}, true
		case "Lifecycle":
			return []string{}, true
		case "SecurityContext":
			return []string{}, true
		case "TerminationMessagePath":
			return []string{}, true
		case "TerminationMessagePolicy":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v Deploy) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Kind":
			return []string{}, true
		case "Spec":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (DeployKind) RuntimeDoc(names ...string) ([]string, bool) {
	return []string{}, true
}
func (v DigestMeta) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Type":
			return []string{}, true
		case "Digest":
			return []string{}, true
		case "Name":
			return []string{}, true
		case "Size":
			return []string{}, true
		case "Tag":
			return []string{}, true
		case "Platform":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (DigestMetaType) RuntimeDoc(names ...string) ([]string, bool) {
	return []string{}, true
}
func (v EnvVarValueOrFrom) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Value":
			return []string{}, true
		case "ValueFrom":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v Expose) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Type":
			return []string{
				"Type NodePort | Ingress",
			}, true
		case "Paths":
			return []string{
				"Paths [PortName]url",
			}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (FileSize) RuntimeDoc(names ...string) ([]string, bool) {
	return []string{}, true
}
func (v HostPath) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Host":
			return []string{}, true
		case "Path":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v Image) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Name":
			return []string{}, true
		case "Tag":
			return []string{}, true
		case "Digest":
			return []string{}, true
		case "Platforms":
			return []string{}, true
		case "PullPolicy":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v KubePkg) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "TypeMeta":
			return []string{}, true
		case "ObjectMeta":
			return []string{}, true
		case "Spec":
			return []string{}, true
		case "Status":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.TypeMeta, names...); ok {
			return doc, ok
		}
		if doc, ok := runtimeDoc(v.ObjectMeta, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{
		"KubePkg",
	}, true
}

func (v KubePkgList) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "TypeMeta":
			return []string{}, true
		case "ListMeta":
			return []string{}, true
		case "Items":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.TypeMeta, names...); ok {
			return doc, ok
		}
		if doc, ok := runtimeDoc(v.ListMeta, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{
		"KubePkgList",
	}, true
}

func (Manifests) RuntimeDoc(names ...string) ([]string, bool) {
	return []string{}, true
}
func (ScopeType) RuntimeDoc(names ...string) ([]string, bool) {
	return []string{}, true
}
func (v Service) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Ports":
			return []string{
				"Ports [PortName]servicePort",
			}, true
		case "ClusterIP":
			return []string{}, true
		case "Expose":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v ServiceAccount) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Scope":
			return []string{}, true
		case "Rules":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v Spec) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Version":
			return []string{}, true
		case "Deploy":
			return []string{}, true
		case "Config":
			return []string{}, true
		case "Containers":
			return []string{}, true
		case "Volumes":
			return []string{}, true
		case "Services":
			return []string{}, true
		case "ServiceAccount":
			return []string{}, true
		case "Manifests":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (SpecObject) RuntimeDoc(names ...string) ([]string, bool) {
	return []string{}, true
}
func (v Status) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Images":
			return []string{}, true
		case "Digests":
			return []string{}, true
		case "Statuses":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (Statuses) RuntimeDoc(names ...string) ([]string, bool) {
	return []string{}, true
}
func (v Volume) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "MountPath":
			return []string{}, true
		case "Prefix":
			return []string{
				"Prefix mountPath == export, use as envFrom",
			}, true
		case "Optional":
			return []string{}, true
		case "ReadOnly":
			return []string{
				"else volumeMounts",
			}, true
		case "SubPath":
			return []string{}, true
		case "Type":
			return []string{}, true
		case "Opt":
			return []string{
				"VolumeSource as opt",
			}, true
		case "Spec":
			return []string{
				"Spec when Type equals ConfigMap or Secret, could use to define data",
			}, true

		}

		return nil, false
	}
	return []string{}, true
}
