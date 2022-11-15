package manifest

import "bytes"

type ConfigurationDatabase struct {
	Scheme   string
	Host     string
	Username string
	Password string
	Name     string
	Extra    string
}

func (c ConfigurationDatabase) Endpoint() string {
	b := bytes.NewBuffer(nil)
	b.WriteString(c.Scheme)
	b.WriteString("://")

	hasUserPassword := false

	if c.Username != "" {
		hasUserPassword = true
		b.WriteString(c.Username)
	}

	if c.Password != "" {
		hasUserPassword = true
		b.WriteString(":")
		b.WriteString(c.Password)
	}

	if hasUserPassword {
		b.WriteString("@")
	}

	b.WriteString(c.Host)

	if c.Name != "" {
		b.WriteString("/")
		b.WriteString(c.Name)
	}

	if c.Extra != "" {
		b.WriteString("?")
		b.WriteString(c.Extra)
	}

	return b.String()
}
