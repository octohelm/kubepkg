package v1alpha1

import (
	"github.com/octohelm/kubepkg/pkg/util"
	appsv1 "k8s.io/api/apps/v1"
	batchv1 "k8s.io/api/batch/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type DeployCronJob struct {
	Kind        string              `json:"kind" validate:"@string{CronJob}"`
	Annotations map[string]string   `json:"annotations,omitempty"`
	Spec        batchv1.CronJobSpec `json:"spec,omitempty"`
}

func (x *DeployCronJob) ToResource(kpkg *KubePkg) (client.Object, error) {
	cronJob := &batchv1.CronJob{}
	cronJob.SetGroupVersionKind(appsv1.SchemeGroupVersion.WithKind("CronJob"))
	cronJob.SetNamespace(kpkg.Namespace)
	cronJob.SetName(kpkg.Name)

	podTemplateSpec, err := toPodTemplateSpec(kpkg)
	if err != nil {
		return nil, err
	}

	cronJob.Spec.JobTemplate.Spec.Template = *podTemplateSpec
	cronJob.Spec.JobTemplate.Spec.Selector = &metav1.LabelSelector{
		MatchLabels: cronJob.Spec.JobTemplate.Spec.Template.Labels,
	}

	spec, err := util.Merge(&cronJob.Spec, &x.Spec)
	if err != nil {
		return nil, err
	}
	cronJob.Spec = *spec

	patchReloadAnnotation(cronJob, podTemplateSpec)

	return cronJob, nil
}
