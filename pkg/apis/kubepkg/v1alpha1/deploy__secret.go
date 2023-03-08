package v1alpha1

import (
	corev1 "k8s.io/api/core/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type DeploySecret struct {
	Kind        string            `json:"kind" validate:"@string{Secret}"`
	Annotations map[string]string `json:"annotations,omitempty"`
}

func (x *DeploySecret) ToResource(kpkg *KubePkg) (client.Object, error) {
	secret := &corev1.Secret{}
	secret.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("Secret"))
	secret.SetNamespace(kpkg.Namespace)
	secret.SetName(kpkg.Name)

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
	secret.StringData = data

	return secret, nil
}
