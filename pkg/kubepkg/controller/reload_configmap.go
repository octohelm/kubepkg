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

type ConfigMapReloadReconciler struct {
	ctrl.Manager
}

func (r *ConfigMapReloadReconciler) SetupWithManager(mgr ctrl.Manager) error {
	r.Manager = mgr

	c := ctrl.NewControllerManagedBy(mgr).
		For(&corev1.ConfigMap{}, builder.WithPredicates(predicate.Funcs{
			UpdateFunc: func(e event.UpdateEvent) bool {
				if reload := kubeutil.GetAnnotate(e.ObjectNew, annotation.Reload); reload == "enabled" {
					return manifest.StringDataHash(e.ObjectNew.(*corev1.ConfigMap).Data) != kubeutil.GetAnnotate(e.ObjectNew, annotation.ReloadHash)
				}
				return false
			},
		}))

	return c.Complete(r)
}

func (r *ConfigMapReloadReconciler) Reconcile(ctx context.Context, request reconcile.Request) (reconcile.Result, error) {
	l := r.GetLogger().WithName("ConfigMapReload").WithValues("request", request.NamespacedName)

	cm := &corev1.ConfigMap{}

	if err := r.GetAPIReader().Get(ctx, request.NamespacedName, cm); err != nil {
		if apierrors.IsNotFound(err) {
			return reconcile.Result{}, nil
		}
		return reconcile.Result{}, err
	}

	hashKey := annotation.ConfigMapHashKey(cm.Name)
	hash := manifest.StringDataHash(cm.Data)
	prevHash := kubeutil.GetAnnotate(cm, hashKey)
	if hash == prevHash {
		return reconcile.Result{}, nil
	}

	kubeutil.Label(cm, annotation.AppName, cm.Name)
	kubeutil.Annotate(cm, annotation.ReloadHash, hash)

	if err := r.GetClient().Patch(ctx, cm, client.Merge); err != nil {
		return reconcile.Result{}, err
	}

	err := RangeWorkload(ctx, r.GetClient(), request.Namespace, func(o client.Object) error {
		if IsReloadMatch(o, annotation.ReloadConfigMap, request.Name) {
			AnnotateHash(o, hashKey, hash)

			if err := r.GetClient().Patch(ctx, o, client.Merge); err != nil {
				return err
			}
			gvk := o.GetObjectKind().GroupVersionKind()
			l.Info(fmt.Sprintf("Reload %s %s.%s", gvk.Kind, o.GetName(), o.GetNamespace()))
		}
		return nil
	})
	if err != nil {
		return reconcile.Result{}, err
	}

	return reconcile.Result{}, nil
}
