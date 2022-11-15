package manifest

import (
	"strings"

	"github.com/containerd/containerd/platforms"
	"github.com/octohelm/kubepkg/pkg/annotation"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	rbacv1 "k8s.io/api/rbac/v1"
)

func ManifestsFromWildcard(kpkg *v1alpha1.KubePkg) (map[string]Object, error) {
	c := &completer{kpkg: kpkg}
	manifests, err := Extract(
		kpkg.Spec.Manifests,
		c.patchNamespace,
		c.patchNodeAffinityIfNeed,
		c.patchConfigMapOrSecretReloadIfNeed,
	)
	if err != nil {
		return nil, err
	}

	patchReload(manifests)
	return manifests, err
}

type completer struct {
	kpkg *v1alpha1.KubePkg
}

func (c *completer) GetAnnotation(key string) string {
	for k, v := range c.kpkg.Annotations {
		if strings.ToLower(k) == key {
			return v
		}
	}
	return ""
}

func (c *completer) patchNamespace(o Object) (Object, error) {
	o.SetNamespace(c.kpkg.Namespace)

	if gvk := o.GetObjectKind().GroupVersionKind(); gvk.Group == rbacv1.GroupName {
		switch gvk.Kind {
		case "RoleBinding":
			d, err := FromUnstructured[rbacv1.RoleBinding](o)
			if err != nil {
				return nil, err
			}
			for i := range d.Subjects {
				s := d.Subjects[i]
				s.Namespace = c.kpkg.Namespace
				d.Subjects[i] = s
			}
			return d, nil
		case "ClusterRoleBinding":
			d, err := FromUnstructured[rbacv1.ClusterRoleBinding](o)
			if err != nil {
				return nil, err
			}
			for i := range d.Subjects {
				s := d.Subjects[i]
				s.Namespace = c.kpkg.Namespace
				d.Subjects[i] = s
			}
			return d, nil

		}
	}

	return o, nil
}

func (c *completer) patchConfigMapOrSecretReloadIfNeed(o Object) (Object, error) {
	gvk := o.GetObjectKind().GroupVersionKind()
	if gvk.Group == corev1.GroupName {
		switch gvk.Kind {
		case "ConfigMap":
			d, err := FromUnstructured[corev1.ConfigMap](o)
			if err != nil {
				return nil, err
			}
			return d, nil
		case "Secret":
			d, err := FromUnstructured[corev1.Secret](o)
			if err != nil {
				return nil, err
			}
			return d, nil
		}
	}

	if gvk.Group == appsv1.GroupName {
		switch gvk.Kind {
		case "Deployment":
			d, err := FromUnstructured[appsv1.Deployment](o)
			if err != nil {
				return nil, err
			}
			c.annotateReloadIfNeed(d, &d.Spec.Template)
			return d, nil
		case "StatefulSet":
			d, err := FromUnstructured[appsv1.StatefulSet](o)
			if err != nil {
				return nil, err
			}
			c.annotateReloadIfNeed(d, &d.Spec.Template)
			return d, nil
		case "DaemonSet":
			d, err := FromUnstructured[appsv1.DaemonSet](o)
			if err != nil {
				return nil, err
			}
			c.annotateReloadIfNeed(d, &d.Spec.Template)
			return d, nil
		}
	}
	return o, nil
}

func (c *completer) annotateReloadIfNeed(o Object, pod *corev1.PodTemplateSpec) {
	refs := c.getRefs(pod)
	if len(refs) > 0 {
		for k, names := range refs {
			kubeutil.Annotate(o, k, strings.Join(names, ","))
		}
	}
}

func (c *completer) getRefs(pod *corev1.PodTemplateSpec) map[string][]string {
	refs := make(map[string][]string, 0)

	for _, c := range pod.Spec.Containers {
		for _, e := range c.Env {
			if e.ValueFrom != nil {
				if ref := e.ValueFrom.SecretKeyRef; ref != nil {
					refs[annotation.ReloadSecret] = append(refs[annotation.ReloadSecret], ref.Name)
				}
				if ref := e.ValueFrom.ConfigMapKeyRef; ref != nil {
					refs[annotation.ReloadConfigMap] = append(refs[annotation.ReloadConfigMap], ref.Name)
				}
			}
		}
	}

	for _, v := range pod.Spec.Volumes {
		if cm := v.ConfigMap; cm != nil {
			refs[annotation.ReloadConfigMap] = append(refs[annotation.ReloadConfigMap], cm.Name)
		}
		if s := v.Secret; s != nil {
			refs[annotation.ReloadSecret] = append(refs[annotation.ReloadSecret], s.SecretName)
		}
	}

	return refs
}

func (c *completer) patchNodeAffinityIfNeed(o Object) (Object, error) {
	if v := c.GetAnnotation(annotation.Platforms); v != "" {
		gvk := o.GetObjectKind().GroupVersionKind()
		if gvk.Group == appsv1.GroupName {
			switch gvk.Kind {
			case "Deployment":
				d, err := FromUnstructured[appsv1.Deployment](o)
				if err != nil {
					return nil, err
				}
				c.patchPodNodeAffinity(strings.Split(v, ","), &d.Spec.Template)
				return d, nil
			case "StatefulSet":
				d, err := FromUnstructured[appsv1.StatefulSet](o)
				if err != nil {
					return nil, err
				}
				c.patchPodNodeAffinity(strings.Split(v, ","), &d.Spec.Template)
				return d, nil
			case "DaemonSet":
				d, err := FromUnstructured[appsv1.DaemonSet](o)
				if err != nil {
					return nil, err
				}
				c.patchPodNodeAffinity(strings.Split(v, ","), &d.Spec.Template)
				return d, nil
			}
		}
	}
	return o, nil
}

func (c *completer) patchPodNodeAffinity(pls []string, pod *corev1.PodTemplateSpec) {
	archs := make([]string, 0, len(pls))

	for _, p := range pls {
		pl, err := platforms.Parse(p)
		if err == nil {
			archs = append(archs, pl.Architecture)
		}
	}

	if len(archs) > 0 {
		pod.Spec.Affinity = must(pod.Spec.Affinity)
		pod.Spec.Affinity.NodeAffinity = must(pod.Spec.Affinity.NodeAffinity)
		pod.Spec.Affinity.NodeAffinity.RequiredDuringSchedulingIgnoredDuringExecution = must(pod.Spec.Affinity.NodeAffinity.RequiredDuringSchedulingIgnoredDuringExecution)
		pod.Spec.Affinity.NodeAffinity.RequiredDuringSchedulingIgnoredDuringExecution.NodeSelectorTerms = append(
			pod.Spec.Affinity.NodeAffinity.RequiredDuringSchedulingIgnoredDuringExecution.NodeSelectorTerms,
			corev1.NodeSelectorTerm{
				MatchExpressions: []corev1.NodeSelectorRequirement{{
					Key:      "kubernetes.io/arch",
					Operator: "In",
					Values:   archs,
				}},
			},
		)
	}
}

func must[T any](v *T) *T {
	if v == nil {
		v = new(T)
	}
	return v
}
