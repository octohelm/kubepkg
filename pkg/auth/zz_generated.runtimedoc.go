/*
Package auth GENERATED BY gengo:runtimedoc
DON'T EDIT THIS FILE
*/
package auth

// nolint:deadcode,unused
func runtimeDoc(v any, names ...string) ([]string, bool) {
	if c, ok := v.(interface {
		RuntimeDoc(names ...string) ([]string, bool)
	}); ok {
		return c.RuntimeDoc(names...)
	}
	return nil, false
}

func (Authorizations) RuntimeDoc(names ...string) ([]string, bool) {
	return []string{}, true
}
func (v OIDC) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Endpoint":
			return []string{
				"OpenIDConnect Endpoint, when empty, oidc feature disabled.",
			}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v Provider) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "RedirectURI":
			return []string{
				"Should be full callback URI",
				"example https://host/authorize/callback/{name}",
			}, true
		case "AutoCreatedBy":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v ProviderInfo) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Type":
			return []string{}, true
		case "Name":
			return []string{}, true

		}

		return nil, false
	}
	return []string{}, true
}

func (v Token) RuntimeDoc(names ...string) ([]string, bool) {
	if len(names) > 0 {
		switch names[0] {
		case "Type":
			return []string{}, true
		case "AccessToken":
			return []string{}, true
		case "RefreshToken":
			return []string{}, true
		case "ID":
			return []string{
				"AccountID",
			}, true

		}

		return nil, false
	}
	return []string{}, true
}