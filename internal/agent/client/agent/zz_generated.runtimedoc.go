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

func (v ApplyKubePkg) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "KubepkgV1Alpha1KubePkg":
			return []string{}, true
		case "ReadCloser":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.KubepkgV1Alpha1KubePkg, names...); ok {
			return doc, ok
		}
		if doc, ok := runtimeDoc(v.ReadCloser, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}

func (v Client) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Endpoint":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v DelKubePkg) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Name":
			return []string{}, true
		case "Namespace":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v GetKubePkg) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Name":
			return []string{}, true
		case "Namespace":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v ListKubePkg) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {

		}

		return nil, false
	}
	return []string{}, true
}

func (v StatBlob) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Digest":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v UploadBlob) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "ContentType":
			return []string{}, true
		case "ReadCloser":
			return []string{}, true

		}
		if doc, ok := runtimeDoc(v.ReadCloser, names...); ok {
			return doc, ok
		}

		return nil, false
	}
	return []string{}, true
}