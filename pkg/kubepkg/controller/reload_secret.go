package controller

import (
	"context"
	"fmt"

	"github.com/octohelm/kubepkg/pkg/annotation"
	"github.com/octohelm/kubepkg/pkg/kubepkg/manifest"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/builder"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/event"
	"sigs.k8s.io/controller-runtime/pkg/predicate"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"
)

type SecretReloadReconciler struct {
	ctrl.Manager
}

func (r *SecretReloadReconciler) SetupWithManager(mgr ctrl.Manager) error {
	r.Manager = mgr

	c := ctrl.NewControllerManagedBy(mgr).
		For(&corev1.Secret{}, builder.WithPredicates(predicate.Funcs{
			UpdateFunc: func(e event.UpdateEvent) bool {
				if reload := kubeutil.GetAnnotate(e.ObjectNew, annotation.Reload); reload == "enabled" {
					return manifest.DataHash(e.ObjectNew.(*corev1.Secret).Data) != kubeutil.GetAnnotate(e.ObjectNew, annotation.ReloadHash)
				}
				return false
			},
		}))

	return c.Complete(r)
}

func (r *SecretReloadReconciler) Reconcile(ctx context.Context, request reconcile.Request) (reconcile.Result, error) {
	l := r.GetLogger().WithName("SecretReload").WithValues("request", request.NamespacedName)

	s := &corev1.Secret{}

	if err := r.GetAPIReader().Get(ctx, request.NamespacedName, s); err != nil {
		if apierrors.IsNotFound(err) {
			return reconcile.Result{}, nil
		}
		return reconcile.Result{}, err
	}

	if label := kubeutil.GetLabel(s, annotation.LabelAppName); label == "" {
		return reconcile.Result{}, nil
	}

	hashKey := annotation.SecretHashKey(s.Name)
	hash := manifest.DataHash(s.Data)
	prevHash := kubeutil.GetAnnotate(s, hashKey)
	if hash == prevHash {
		return reconcile.Result{}, nil
	}

	kubeutil.Annotate(s, annotation.ReloadHash, hash)

	if err := r.GetClient().Patch(ctx, s, client.Merge); err != nil {
		return reconcile.Result{}, err
	}

	err := RangeWorkload(ctx, r.GetClient(), request.Namespace, func(o client.Object) error {
		if IsReloadMatch(o, annotation.ReloadSecret, request.Name) {
			if manifest.AnnotateHash(o, hashKey, hash) {
				if err := r.GetClient().Patch(ctx, o, client.Merge); err != nil {
					return err
				}
				gvk := o.GetObjectKind().GroupVersionKind()
				l.Info(fmt.Sprintf("Reload %s %s.%s", gvk.Kind, o.GetName(), o.GetNamespace()))
			}
		}
		return nil
	})
	if err != nil {
		return reconcile.Result{}, err
	}

	return reconcile.Result{}, nil
}
