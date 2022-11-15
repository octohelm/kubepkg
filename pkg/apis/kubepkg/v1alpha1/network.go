package v1alpha1

import (
	"net/url"
)

type Service struct {
	// Ports [PortName]servicePort
	Ports     map[string]int32 `json:"ports,omitempty"`
	ClusterIP string           `json:"clusterIP,omitempty"`
	Expose    Expose           `json:"expose,omitempty"`
}

type Expose struct {
	// Type NodePort | Ingress
	Type string `json:"type"`
	// Paths [PortName]url
	Paths map[string]HostPath `json:"paths,omitempty"`
}

type HostPath struct {
	Host string
	Path string
}

func (h *HostPath) UnmarshalText(text []byte) error {
	u, err := url.Parse(string(text))
	if err != nil {
		return err
	}
	h.Host = u.Host
	h.Path = u.Path
	return nil
}

func (h HostPath) MarshalText() (text []byte, err error) {
	u := &url.URL{}
	u.Host = h.Host
	u.Path = h.Path
	return []byte(u.String()), nil
}
