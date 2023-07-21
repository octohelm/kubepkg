package v1alpha1

import (
	"github.com/octohelm/kubepkg/pkg/util"
	corev1 "k8s.io/api/core/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type VolumePersistentVolumeClaim struct {
	Type string                                    `json:"type" validate:"@string{PersistentVolumeClaim}"`
	Opt  *corev1.PersistentVolumeClaimVolumeSource `json:"opt,omitempty"`
	Spec corev1.PersistentVolumeClaimSpec          `json:"spec"`
	VolumeMount
}

func (v *VolumePersistentVolumeClaim) ToResource(kpkg *KubePkg, resourceName string) (client.Object, error) {
	pvc := &corev1.PersistentVolumeClaim{}
	pvc.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("PersistentVolumeClaim"))
	pvc.SetNamespace(kpkg.Namespace)
	pvc.SetName(resourceName)

	spec, err := util.Merge(&pvc.Spec, &v.Spec)
	if err != nil {
		return nil, err
	}
	pvc.Spec = *spec

	return pvc, nil
}

func (v *VolumePersistentVolumeClaim) Mount(name string) *MountResult {
	ret := &MountResult{
		ResourceName: name,
	}

	if v.MountPath != "export" {
		ret.Volume = &corev1.Volume{
			Name: ret.ResourceName,
		}

		ret.Volume.PersistentVolumeClaim = v.Opt
		if ret.Volume.PersistentVolumeClaim == nil {
			ret.Volume.PersistentVolumeClaim = &corev1.PersistentVolumeClaimVolumeSource{}
		}
		ret.Volume.PersistentVolumeClaim.ClaimName = ret.ResourceName

		ret.VolumeMount = &corev1.VolumeMount{
			Name: ret.ResourceName,
		}
		v.VolumeMount.MountTo(ret.VolumeMount)
	}

	return ret
}
