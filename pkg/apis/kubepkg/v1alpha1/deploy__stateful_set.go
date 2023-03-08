package v1alpha1

import (
	"github.com/octohelm/kubepkg/pkg/util"
	appsv1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type DeployStatefulSet struct {
	Kind        string                 `json:"kind" validate:"@string{StatefulSet}"`
	Annotations map[string]string      `json:"annotations,omitempty"`
	Spec        appsv1.StatefulSetSpec `json:"spec,omitempty"`
}

func (x *DeployStatefulSet) ToResource(kpkg *KubePkg) (client.Object, error) {
	statefulSet := &appsv1.StatefulSet{}
	statefulSet.SetGroupVersionKind(appsv1.SchemeGroupVersion.WithKind("StatefulSet"))
	statefulSet.SetNamespace(kpkg.Namespace)
	statefulSet.SetName(kpkg.Name)

	podTemplateSpec, err := toPodTemplateSpec(kpkg)
	if err != nil {
		return nil, err
	}

	statefulSet.Spec.Template = *podTemplateSpec
	statefulSet.Spec.Selector = &metav1.LabelSelector{
		MatchLabels: statefulSet.Spec.Template.Labels,
	}

	spec, err := util.Merge(&statefulSet.Spec, &x.Spec)
	if err != nil {
		return nil, err
	}
	statefulSet.Spec = *spec

	patchReloadAnnotation(statefulSet, podTemplateSpec)

	return statefulSet, nil
}
