package v1alpha1

import (
	"github.com/octohelm/kubepkg/pkg/util"
	appsv1 "k8s.io/api/apps/v1"
	batchv1 "k8s.io/api/batch/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type DeployJob struct {
	Kind        string            `json:"kind" validate:"@string{Job}"`
	Annotations map[string]string `json:"annotations,omitempty"`
	Spec        batchv1.JobSpec   `json:"spec,omitempty"`
}

func (x *DeployJob) ToResource(kpkg *KubePkg) (client.Object, error) {
	job := &batchv1.Job{}
	job.SetGroupVersionKind(appsv1.SchemeGroupVersion.WithKind("Job"))
	job.SetNamespace(kpkg.Namespace)
	job.SetName(kpkg.Name)

	podTemplateSpec, err := toPodTemplateSpec(kpkg)
	if err != nil {
		return nil, err
	}

	job.Spec.Template = *podTemplateSpec
	job.Spec.Selector = &metav1.LabelSelector{
		MatchLabels: job.Spec.Template.Labels,
	}

	spec, err := util.Merge(&job.Spec, &x.Spec)
	if err != nil {
		return nil, err
	}
	job.Spec = *spec

	patchReloadAnnotation(job, podTemplateSpec)

	return job, nil
}
