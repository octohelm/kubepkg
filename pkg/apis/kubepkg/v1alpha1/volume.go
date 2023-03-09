package v1alpha1

import (
	"encoding/json"

	"github.com/tidwall/gjson"
	v1 "k8s.io/api/core/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
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

// +gengo:deepcopy=false
type Volume struct {
	VolumeSource `json:"-"`
}

func (in *Volume) DeepCopy() *Volume {
	if in == nil {
		return nil
	}
	out := new(Volume)
	in.DeepCopyInto(out)
	return out
}

func (in *Volume) DeepCopyInto(out *Volume) {
	out.VolumeSource = in.VolumeSource
}

type MountResult struct {
	Reload        string
	ResourceName  string
	Volume        *v1.Volume
	EnvFromSource *v1.EnvFromSource
	VolumeMount   *v1.VolumeMount
}

type VolumeSource interface {
	ToResource(kpkg *KubePkg, name string) (client.Object, error)
	Mount(name string) *MountResult
}

func (d *Volume) UnmarshalJSON(data []byte) error {
	v := gjson.GetBytes(data, d.Discriminator())

	if t, ok := d.Mapping()[v.Str]; ok {
		if err := json.Unmarshal(data, t); err != nil {
			return err
		}
		d.VolumeSource = t.(VolumeSource)
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
		"EmptyDir":              VolumeSource(&VolumeEmptyDir{}),
		"HostPath":              VolumeSource(&VolumeHostPath{}),
		"Secret":                VolumeSource(&VolumeSecret{}),
		"ConfigMap":             VolumeSource(&VolumeConfigMap{}),
		"PersistentVolumeClaim": VolumeSource(&VolumePersistentVolumeClaim{}),
	}
}
