package v1alpha1

import (
	"github.com/octohelm/kubepkg/pkg/annotation"
	corev1 "k8s.io/api/core/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type VolumeSecret struct {
	Type string                     `json:"type" validate:"@string{Secret}"`
	Opt  *corev1.SecretVolumeSource `json:"opt,omitempty"`
	Spec *SpecData                  `json:"spec,omitempty"`
	VolumeMount
}

func (v *VolumeSecret) ToResource(kpkg *KubePkg, resourceName string) (client.Object, error) {
	secret := &corev1.Secret{}
	secret.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("Secret"))
	secret.SetNamespace(kpkg.Namespace)
	secret.SetName(resourceName)

	if spec := v.Spec; spec != nil {
		secret.StringData = spec.Data
	}

	return secret, nil
}

func (v *VolumeSecret) Mount(name string) *MountResult {
	ret := &MountResult{
		Reload:       annotation.ReloadSecret,
		ResourceName: name,
	}

	if v.MountPath == "export" {
		ret.EnvFromSource = &corev1.EnvFromSource{
			Prefix: v.Prefix,
		}

		ret.EnvFromSource.SecretRef = &corev1.SecretEnvSource{}
		ret.EnvFromSource.SecretRef.Name = ret.ResourceName
		ret.EnvFromSource.SecretRef.Optional = v.Optional

		return ret
	}

	ret.Volume = &corev1.Volume{
		Name: ret.ResourceName,
	}

	ret.Volume.Secret = v.Opt
	if ret.Volume.Secret == nil {
		ret.Volume.Secret = &corev1.SecretVolumeSource{}
	}
	ret.Volume.Secret.SecretName = ret.ResourceName

	ret.VolumeMount = &corev1.VolumeMount{
		Name: ret.ResourceName,
	}
	v.VolumeMount.MountTo(ret.VolumeMount)

	return ret
}
