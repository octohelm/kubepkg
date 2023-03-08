package v1alpha1

import (
	corev1 "k8s.io/api/core/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type DeployConfigMap struct {
	Kind        string            `json:"kind" validate:"@string{ConfigMap}"`
	Annotations map[string]string `json:"annotations,omitempty"`
}

func (x *DeployConfigMap) ToResource(kpkg *KubePkg) (client.Object, error) {
	configMap := &corev1.ConfigMap{}
	configMap.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("ConfigMap"))
	configMap.SetNamespace(kpkg.Namespace)
	configMap.SetName(kpkg.Name)

	configurationType := ""
	if x.Annotations != nil {
		if ct, ok := x.Annotations["configuration.octohelm.tech/type"]; ok {
			configurationType = ct
		}
	}
	data, err := configDataFrom(configurationType, kpkg.Spec.Config)
	if err != nil {
		return nil, err
	}
	configMap.Data = data

	return configMap, nil
}
