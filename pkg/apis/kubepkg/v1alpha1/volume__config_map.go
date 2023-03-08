package v1alpha1

import (
	"github.com/octohelm/kubepkg/pkg/annotation"
	v1 "k8s.io/api/core/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type VolumeConfigMap struct {
	Type string                    `json:"type" validate:"@string{ConfigMap}"`
	Opt  *v1.ConfigMapVolumeSource `json:"opt,omitempty"`
	Spec *SpecData                 `json:"spec,omitempty"`
	VolumeMount
}

func (v *VolumeConfigMap) ToResource(kpkg *KubePkg, resourceName string) (client.Object, error) {
	cm := &v1.ConfigMap{}
	cm.SetGroupVersionKind(v1.SchemeGroupVersion.WithKind("ConfigMap"))
	cm.SetNamespace(kpkg.Namespace)
	cm.SetName(resourceName)

	if spec := v.Spec; spec != nil {
		cm.Data = spec.Data
	}

	return cm, nil
}

func (v *VolumeConfigMap) Mount(name string) *MountResult {
	ret := &MountResult{
		Reload:       annotation.ReloadConfigMap,
		ResourceName: name,
	}

	if v.MountPath == "export" {
		ret.EnvFromSource = &v1.EnvFromSource{
			Prefix: v.Prefix,
		}

		ret.EnvFromSource.ConfigMapRef = &v1.ConfigMapEnvSource{}
		ret.EnvFromSource.ConfigMapRef.Name = ret.ResourceName
		ret.EnvFromSource.ConfigMapRef.Optional = v.Optional

		return ret
	}

	ret.Volume = &v1.Volume{
		Name: ret.ResourceName,
	}

	ret.Volume.ConfigMap = v.Opt
	if ret.Volume.ConfigMap == nil {
		ret.Volume.ConfigMap = &v1.ConfigMapVolumeSource{}
	}
	ret.Volume.ConfigMap.Name = ret.ResourceName

	ret.VolumeMount = &v1.VolumeMount{
		Name: ret.ResourceName,
	}
	ret.VolumeMount.MountPath = v.MountPath
	ret.VolumeMount.SubPath = v.SubPath
	ret.VolumeMount.ReadOnly = v.ReadOnly

	return ret
}

type SpecData struct {
	Data map[string]string `json:"data"`
}
