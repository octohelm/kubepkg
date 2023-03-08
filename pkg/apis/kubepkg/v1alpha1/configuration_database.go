package v1alpha1

import (
	"bytes"
	"fmt"
)

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

func configDataFrom(tpe string, config map[string]EnvVarValueOrFrom) (map[string]string, error) {
	values := map[string]string{}
	for k := range config {
		if config[k].ValueFrom != nil {
			return nil, fmt.Errorf("config.%q: ref value is not support", k)
		}
		values[k] = config[k].Value
	}

	// FIXME switch as some factory
	switch tpe {
	case "database":
		conf := &ConfigurationDatabase{}
		conf.Name = values["name"]
		conf.Scheme = values["scheme"]
		conf.Host = values["host"]
		conf.Username = values["username"]
		conf.Password = values["password"]
		conf.Extra = values["extra"]

		values["endpoint"] = conf.Endpoint()
	}

	return values, nil
}
