package v1alpha1

import (
	corev1 "k8s.io/api/core/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type VolumeHostPath struct {
	Type string                       `json:"type" validate:"@string{HostPath}"`
	Opt  *corev1.HostPathVolumeSource `json:"opt,omitempty"`
	VolumeMount
}

func (v *VolumeHostPath) ToResource(kpkg *KubePkg, resourceName string) (client.Object, error) {
	return nil, nil
}

func (v *VolumeHostPath) Mount(name string) *MountResult {
	ret := &MountResult{
		ResourceName: name,
	}

	if v.MountPath != "export" {
		ret.Volume = &corev1.Volume{
			Name: ret.ResourceName,
		}

		ret.Volume.HostPath = v.Opt
		if ret.Volume.HostPath == nil {
			ret.Volume.HostPath = &corev1.HostPathVolumeSource{}
		}

		ret.VolumeMount = &corev1.VolumeMount{
			Name: ret.ResourceName,
		}

		v.VolumeMount.MountTo(ret.VolumeMount)
	}

	return ret
}
