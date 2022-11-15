package controller

import (
	"context"
	"strings"

	"github.com/octohelm/kubepkg/pkg/kubeutil"
	appsv1 "k8s.io/api/apps/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

func Apply(ctx context.Context, cc client.Client, o client.Object) error {
	if err := cc.Patch(ctx, o, client.Apply, FieldOwner, client.ForceOwnership); err != nil {
		return err
	}
	return nil
}

func AnnotateHash(o client.Object, key string, hash string) {
	switch m := o.(type) {
	case *appsv1.Deployment:
		kubeutil.Annotate(&m.Spec.Template, key, hash)
	case *appsv1.StatefulSet:
		kubeutil.Annotate(&m.Spec.Template, key, hash)
	case *appsv1.DaemonSet:
		kubeutil.Annotate(&m.Spec.Template, key, hash)
	}
}

func RangeWorkload(ctx context.Context, c client.Client, namespace string, each func(o client.Object) error) error {
	lists := []client.ObjectList{
		&appsv1.DeploymentList{},
		&appsv1.StatefulSetList{},
		&appsv1.DaemonSetList{},
	}

	for i := range lists {
		list := lists[i]
		if err := c.List(ctx, list, client.InNamespace(namespace)); err != nil {
			return err
		}

		switch l := list.(type) {
		case *appsv1.DeploymentList:
			for i := range l.Items {
				if err := each(&l.Items[i]); err != nil {
					return err
				}
			}
		case *appsv1.StatefulSetList:
			for i := range l.Items {
				if err := each(&l.Items[i]); err != nil {
					return err
				}
			}
		case *appsv1.DaemonSetList:
			for i := range l.Items {
				if err := each(&l.Items[i]); err != nil {
					return err
				}
			}
		}
	}

	return nil
}

func IsReloadMatch(o client.Object, key string, n string) bool {
	if annotations := o.GetAnnotations(); annotations != nil {
		if v, ok := annotations[key]; ok {
			for _, nn := range strings.Split(v, ",") {
				if nn == n {
					return true
				}
			}
		}
	}
	return false
}
