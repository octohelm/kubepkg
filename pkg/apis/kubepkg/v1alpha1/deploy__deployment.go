package v1alpha1

import (
	"github.com/octohelm/kubepkg/pkg/util"
	appsv1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type DeployDeployment struct {
	Kind        string                `json:"kind" validate:"@string{Deployment}"`
	Annotations map[string]string     `json:"annotations,omitempty"`
	Spec        appsv1.DeploymentSpec `json:"spec,omitempty"`
}

func (x *DeployDeployment) ToResource(kpkg *KubePkg) (client.Object, error) {
	deployment := &appsv1.Deployment{}
	deployment.SetGroupVersionKind(appsv1.SchemeGroupVersion.WithKind("Deployment"))
	deployment.SetNamespace(kpkg.Namespace)
	deployment.SetName(kpkg.Name)

	podTemplateSpec, err := toPodTemplateSpec(kpkg)
	if err != nil {
		return nil, err
	}

	deployment.Spec.Template = *podTemplateSpec
	deployment.Spec.Selector = &metav1.LabelSelector{
		MatchLabels: deployment.Spec.Template.Labels,
	}

	spec, err := util.Merge(&deployment.Spec, &x.Spec)
	if err != nil {
		return nil, err
	}
	deployment.Spec = *spec

	patchReloadAnnotation(deployment, podTemplateSpec)

	return deployment, nil
}
