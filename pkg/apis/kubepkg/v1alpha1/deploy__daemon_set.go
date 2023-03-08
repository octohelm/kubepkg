package v1alpha1

import (
	"github.com/octohelm/kubepkg/pkg/util"
	appsv1 "k8s.io/api/apps/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type DeployDaemonSet struct {
	Kind        string               `json:"kind" validate:"@string{DaemonSet}"`
	Annotations map[string]string    `json:"annotations,omitempty"`
	Spec        appsv1.DaemonSetSpec `json:"spec,omitempty"`
}

func (x *DeployDaemonSet) ToResource(kpkg *KubePkg) (client.Object, error) {
	daemonSet := &appsv1.DaemonSet{}
	daemonSet.SetGroupVersionKind(appsv1.SchemeGroupVersion.WithKind("DaemonSet"))
	daemonSet.SetNamespace(kpkg.Namespace)
	daemonSet.SetName(kpkg.Name)

	podTemplateSpec, err := toPodTemplateSpec(kpkg)
	if err != nil {
		return nil, err
	}

	daemonSet.Spec.Template = *podTemplateSpec
	daemonSet.Spec.Selector = &metav1.LabelSelector{
		MatchLabels: daemonSet.Spec.Template.Labels,
	}

	spec, err := util.Merge(&daemonSet.Spec, &x.Spec)
	if err != nil {
		return nil, err
	}
	daemonSet.Spec = *spec

	patchReloadAnnotation(daemonSet, podTemplateSpec)

	return daemonSet, nil
}
