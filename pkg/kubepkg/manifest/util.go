package manifest

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"

	"github.com/octohelm/kubepkg/pkg/kubeutil"
	appsv1 "k8s.io/api/apps/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

func StringDataHash(inputs map[string]string) string {
	data, _ := json.Marshal(inputs)
	w := sha256.New()
	w.Write(data)
	return fmt.Sprintf("%x", w.Sum(nil))
}

func DataHash(inputs map[string][]byte) string {
	data, _ := json.Marshal(inputs)
	w := sha256.New()
	w.Write(data)
	return fmt.Sprintf("%x", w.Sum(nil))
}

func AnnotateHash(o client.Object, key string, hash string) bool {
	switch m := o.(type) {
	case *appsv1.Deployment:
		return kubeutil.Annotate(&m.Spec.Template, key, hash)
	case *appsv1.StatefulSet:
		return kubeutil.Annotate(&m.Spec.Template, key, hash)
	case *appsv1.DaemonSet:
		return kubeutil.Annotate(&m.Spec.Template, key, hash)
	}
	return false
}
