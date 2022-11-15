package controller

import (
	"context"
	"fmt"

	kubepkgv1alpha1 "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubepkg/manifest"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/builder"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"
)

type KubePkgStatusReconciler struct {
	ctrl.Manager
}

func (r *KubePkgStatusReconciler) SetupWithManager(mgr ctrl.Manager) error {
	r.Manager = mgr

	c := ctrl.NewControllerManagedBy(mgr).For(&kubepkgv1alpha1.KubePkg{})

	gvks, err := kubeutil.AllWatchableGroupVersionKinds(context.Background(), mgr.GetConfig())
	if err != nil {
		return err
	}

	for i := range gvks {
		u := &unstructured.Unstructured{}
		u.SetGroupVersionKind(gvks[i])

		if !IsSupportedGroupKind(u) {
			continue
		}

		c = c.Owns(u, builder.OnlyMetadata)
	}

	return c.Complete(r)
}

func (r *KubePkgStatusReconciler) Reconcile(ctx context.Context, request reconcile.Request) (reconcile.Result, error) {
	l := r.GetLogger().WithValues("Reconcile", "Status", "request", request.NamespacedName)

	kpkg := &kubepkgv1alpha1.KubePkg{}

	if err := r.GetClient().Get(ctx, request.NamespacedName, kpkg); err != nil {
		if apierrors.IsNotFound(err) {
			return reconcile.Result{}, nil
		}
		return reconcile.Result{}, err
	}

	l.Info(fmt.Sprintf("%s.%s", kpkg.GetName(), kpkg.GetNamespace()))

	cc := r.GetClient()

	statuses := map[string]any{}

	manifests, err := manifest.ExtractComplete(kpkg)
	if err != nil {
		l.Error(err, "extra manifests failed")
		return reconcile.Result{}, nil
	}

	for name := range manifests {
		o := manifests[name]
		// skip unsupported
		if !IsSupportedGroupKind(o) {
			statuses[name] = map[string]any{
				"status": "False",
				"reason": "UnsupportedManifest",
			}
			continue
		}

		if err := r.syncManifestStatus(ctx, statuses, o, name); err != nil {
			return reconcile.Result{}, nil
		}
	}

	if err := r.GetAPIReader().Get(ctx, request.NamespacedName, kpkg); err != nil {
		if apierrors.IsNotFound(err) {
			return reconcile.Result{}, nil
		}
		return reconcile.Result{}, err
	}

	if kpkg.Status == nil {
		kpkg.Status = &kubepkgv1alpha1.Status{}
	}
	kpkg.Status.Statuses = statuses
	if err := cc.Status().Update(ctx, kpkg); err != nil {
		l.Error(err, "update status err")
		return reconcile.Result{}, nil
	}
	return reconcile.Result{}, nil
}

func (r *KubePkgStatusReconciler) syncManifestStatus(ctx context.Context, statuses map[string]any, o client.Object, name string) error {
	gvk := o.GetObjectKind().GroupVersionKind()

	live, err := kubeutil.NewForGroupVersionKind(gvk)
	if err != nil {
		return err
	}

	if err := r.GetAPIReader().Get(ctx, client.ObjectKeyFromObject(o), live); err != nil {
		return err
	}

	if u, ok := live.(*unstructured.Unstructured); ok {
		if status, ok := u.Object["status"]; ok {
			statuses[name] = status
		} else {
			statuses[name] = map[string]any{}
		}
	}

	return nil
}
