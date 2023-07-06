package manifest

import (
	"strings"

	"github.com/octohelm/kubepkg/pkg/annotation"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
)

func ExtractSorted(kpkg *v1alpha1.KubePkg) ([]Object, error) {
	manifests, err := Extract(kpkg)
	if err != nil {
		return nil, err
	}

	list := make([]Object, 0, len(manifests))

	for k := range manifests {
		list = append(list, manifests[k])
	}

	return SortByKind(list), nil
}

func Extract(kpkg *v1alpha1.KubePkg) (map[string]Object, error) {
	final := map[string]Object{}

	manifests, err := ManifestsFromSpec(kpkg)
	if err != nil {
		return nil, err
	}
	for k := range manifests {
		final[k] = manifests[k]
		kubeutil.Label(final[k], annotation.LabelAppName, kpkg.Name)
	}

	wildcardManifests, err := ManifestsFromWildcard(kpkg)
	if err != nil {
		return nil, err
	}
	for k := range wildcardManifests {
		final[k] = wildcardManifests[k]
		kubeutil.Label(final[k], annotation.LabelAppName, kpkg.Name)
	}

	for _, o := range final {
		switch o.(type) {
		case *appsv1.Deployment, *appsv1.StatefulSet, *appsv1.DaemonSet:
			if v := kubeutil.GetAnnotate(o, annotation.ReloadConfigMap); v != "" {
				for _, name := range strings.Split(v, ",") {
					if m, ok := final[strings.ToLower("configmap."+name)]; ok {
						if cm, ok := m.(*corev1.ConfigMap); ok {
							AnnotateHash(o, annotation.ConfigMapHashKey(cm.Name), StringDataHash(cm.Data))
						}
					}
				}
			}
			if v := kubeutil.GetAnnotate(o, annotation.ReloadSecret); v != "" {
				for _, name := range strings.Split(v, ",") {
					if m, ok := final[strings.ToLower("secret."+name)]; ok {
						if s, ok := m.(*corev1.Secret); ok {
							AnnotateHash(o, annotation.SecretHashKey(s.Name), DataHash(s.Data))
						}
					}
				}
			}
		}
	}

	return final, nil
}
