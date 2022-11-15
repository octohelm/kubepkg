package v1alpha1

type Volume struct {
	MountPath string `json:"mountPath"`

	// Prefix mountPath == export, use as envFrom
	Prefix   string `json:"prefix,omitempty"`
	Optional *bool  `json:"optional,omitempty"`

	// else volumeMounts
	ReadOnly bool   `json:"readOnly,omitempty"`
	SubPath  string `json:"subPath,omitempty"`

	Type string `json:"type"`

	// VolumeSource as opt
	Opt SpecObject `json:"opt,omitempty"`

	// Spec when Type equals ConfigMap or Secret, could use to define data
	Spec SpecObject `json:"spec,omitempty"`
}
