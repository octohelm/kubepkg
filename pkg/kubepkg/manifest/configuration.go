package manifest

import (
	"strings"

	"github.com/octohelm/kubepkg/pkg/annotation"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
)

func patchReload(manifests map[string]Object) {
	configHashesInScope := map[string]string{}

	for name := range manifests {
		o := manifests[name]

		switch m := o.(type) {
		case *corev1.ConfigMap:
			configHashesInScope[annotation.ConfigMapHashKey(o.GetName())] = StringDataHash(m.Data)
		case *corev1.Secret:
			configHashesInScope[annotation.SecretHashKey(o.GetName())] = DataHash(m.Data)
		}
	}

	if len(configHashesInScope) > 0 {
		for name := range manifests {
			o := manifests[name]

			for _, reloadKind := range []string{annotation.ReloadConfigMap, annotation.ReloadSecret} {
				if v := kubeutil.GetAnnotate(o, reloadKind); v != "" {
					refs := strings.Split(v, ",")
					externalRefs := make([]string, 0, len(refs))

					for _, nameRef := range refs {
						hashKey := annotation.ConfigMapHashKey(nameRef)

						if hash, ok := configHashesInScope[hashKey]; ok {
							switch m := o.(type) {
							case *appsv1.Deployment:
								kubeutil.Annotate(&m.Spec.Template, hashKey, hash)
							case *appsv1.StatefulSet:
								kubeutil.Annotate(&m.Spec.Template, hashKey, hash)
							case *appsv1.DaemonSet:
								kubeutil.Annotate(&m.Spec.Template, hashKey, hash)
							}
						} else {
							externalRefs = append(externalRefs, nameRef)
						}
					}

					kubeutil.AppendAnnotate(o, reloadKind, strings.Join(externalRefs, ","))
				}
			}
		}
	}
}
