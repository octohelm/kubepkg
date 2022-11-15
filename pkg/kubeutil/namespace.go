package kubeutil

import (
	"context"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	v1 "k8s.io/client-go/applyconfigurations/core/v1"
	clientcorev1 "k8s.io/client-go/kubernetes/typed/core/v1"
	"k8s.io/client-go/rest"
)

func ApplyNamespace(ctx context.Context, c *rest.Config, namespace string) (*corev1.Namespace, error) {
	cs, err := clientcorev1.NewForConfig(c)
	if err != nil {
		return nil, err
	}
	return cs.Namespaces().Apply(ctx, v1.Namespace(namespace), metav1.ApplyOptions{
		Force:        true,
		FieldManager: "kubepkg",
	})
}
