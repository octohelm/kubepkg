package v1alpha1

import (
	"encoding/json"

	"github.com/tidwall/gjson"
	v1 "k8s.io/api/core/v1"
)

type VolumeMount struct {
	MountPath string `json:"mountPath"`

	// Prefix mountPath == export, use as envFrom
	Prefix   string `json:"prefix,omitempty"`
	Optional *bool  `json:"optional,omitempty"`

	// else volumeMounts
	ReadOnly bool   `json:"readOnly,omitempty"`
	SubPath  string `json:"subPath,omitempty"`
}

type Volume struct {
	VolumeSource any `json:"-"`
}

func (d *Volume) UnmarshalJSON(data []byte) error {
	v := gjson.GetBytes(data, d.Discriminator())

	if t, ok := d.Mapping()[v.Str]; ok {
		if err := json.Unmarshal(data, t); err != nil {
			return err
		}
		d.VolumeSource = t
		return nil
	}

	return nil
}

func (d Volume) MarshalJSON() ([]byte, error) {
	if d.VolumeSource == nil {
		return nil, nil
	}
	return json.Marshal(d.VolumeSource)
}

func (Volume) Discriminator() string {
	return "type"
}

func (Volume) Mapping() map[string]any {
	return map[string]any{
		"Secret":                &VolumeSecret{},
		"ConfigMap":             &VolumeConfigMap{},
		"PersistentVolumeClaim": &VolumePersistentVolumeClaim{},
	}
}

type VolumeSecret struct {
	Type string                 `json:"type" validate:"@string{Secret}"`
	Opt  *v1.SecretVolumeSource `json:"opt,omitempty"`
	Spec *SpecData              `json:"spec,omitempty"`
	VolumeMount
}

type VolumeConfigMap struct {
	Type string                    `json:"type" validate:"@string{ConfigMap}"`
	Opt  *v1.ConfigMapVolumeSource `json:"opt,omitempty"`
	Spec *SpecData                 `json:"spec,omitempty"`
	VolumeMount
}

type SpecData struct {
	Data map[string]string `json:"data"`
}

type VolumePersistentVolumeClaim struct {
	Type string                                `json:"type" validate:"@string{PersistentVolumeClaim}"`
	Opt  *v1.PersistentVolumeClaimVolumeSource `json:"opt,omitempty"`
	Spec v1.PersistentVolumeClaimSpec          `json:"spec"`
	VolumeMount
}
