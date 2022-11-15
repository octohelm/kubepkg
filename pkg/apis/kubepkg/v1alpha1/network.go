package v1alpha1

type Service struct {
	// Ports [PortName]servicePort
	Ports map[string]int32 `json:"ports,omitempty"`
	// Paths [PortName]BashPath
	Paths map[string]string `json:"paths,omitempty"`

	ClusterIP string  `json:"clusterIP,omitempty"`
	Expose    *Expose `json:"expose,omitempty"`
}

type Expose struct {
	// Type NodePort | Ingress
	Type    string   `json:"type"`
	Gateway []string `json:"gateway,omitempty"`
}
