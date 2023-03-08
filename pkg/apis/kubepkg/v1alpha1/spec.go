package v1alpha1

type Spec struct {
	Version        string                       `json:"version"`
	Deploy         Deploy                       `json:"deploy,omitempty"`
	Config         map[string]EnvVarValueOrFrom `json:"config,omitempty"`
	Containers     map[string]Container         `json:"containers,omitempty"`
	Volumes        map[string]Volume            `json:"volumes,omitempty"`
	Services       map[string]Service           `json:"services,omitempty"`
	ServiceAccount *ServiceAccount              `json:"serviceAccount,omitempty"`

	Manifests Manifests `json:"manifests,omitempty"`
}

type Manifests map[string]any
