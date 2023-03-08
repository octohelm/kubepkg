package v1alpha1

import (
	corev1 "k8s.io/api/core/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type VolumeEmptyDir struct {
	Type string                       `json:"type" validate:"@string{EmptyDir}"`
	Opt  *corev1.EmptyDirVolumeSource `json:"opt,omitempty"`
	VolumeMount
}

func (v *VolumeEmptyDir) ToResource(kpkg *KubePkg, resourceName string) (client.Object, error) {
	return nil, nil
}

func (v *VolumeEmptyDir) Mount(name string) *MountResult {
	ret := &MountResult{
		ResourceName: name,
	}

	if v.MountPath != "export" {
		ret.Volume = &corev1.Volume{
			Name: ret.ResourceName,
		}

		ret.Volume.EmptyDir = v.Opt
		if ret.Volume.EmptyDir == nil {
			ret.Volume.EmptyDir = &corev1.EmptyDirVolumeSource{}
		}

		ret.VolumeMount = &corev1.VolumeMount{
			Name: ret.ResourceName,
		}
		ret.VolumeMount.MountPath = v.MountPath
		ret.VolumeMount.SubPath = v.SubPath
		ret.VolumeMount.ReadOnly = v.ReadOnly
	}

	return ret
}
