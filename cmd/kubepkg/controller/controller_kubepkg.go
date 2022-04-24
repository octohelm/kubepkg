package controller

import (
	"context"
	"fmt"
	"github.com/octohelm/kubepkg/pkg/kubepkg/manifest"

	"github.com/go-logr/logr"
	kubepkgv1alpha1 "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/builder"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"
)

type KubePkgReconciler struct {
	Client    client.Client
	APIReader client.Reader
	Log       logr.Logger
	Scheme    *runtime.Scheme
}

func (r *KubePkgReconciler) SetupWithManager(mgr ctrl.Manager) error {
	gvks, err := allWatchableGroupVersionKinds(mgr.GetConfig())
	if err != nil {
		return err
	}

	c := ctrl.NewControllerManagedBy(mgr).For(&kubepkgv1alpha1.KubePkg{})

	for i := range gvks {
		if gvks[i].Group == kubepkgv1alpha1.SchemeGroupVersion.Group {
			continue
		}

		u := &unstructured.Unstructured{}
		u.SetGroupVersionKind(gvks[i])
		c = c.Owns(u, builder.OnlyMetadata)
	}

	return c.Complete(r)
}

func (r *KubePkgReconciler) Reconcile(ctx context.Context, request reconcile.Request) (reconcile.Result, error) {
	kpkg := &kubepkgv1alpha1.KubePkg{}

	if err := r.APIReader.Get(ctx, request.NamespacedName, kpkg); err != nil {
		if apierrors.IsNotFound(err) {
			return reconcile.Result{}, nil
		}
		return reconcile.Result{}, err
	}

	r.Log.Info(fmt.Sprintf("Reconciling %s.%s", kpkg.GetName(), kpkg.GetNamespace()))

	manifests, err := manifest.Extract(kpkg.Spec.Manifests)
	if err != nil {
		r.Log.Error(err, "extra manifests failed")
		return reconcile.Result{}, nil
	}

	for name := range manifests {
		o := manifests[name]

		// skip namespace
		if o.GetObjectKind().GroupVersionKind().Kind == "Namespace" {
			continue
		}

		if err := r.ensureManifest(ctx, kpkg, name, o); err != nil {
			r.Log.Error(err, fmt.Sprintf("%s `%s`: apply sub-manifest failed", o.GetObjectKind().GroupVersionKind(), o.GetName()))
		}
	}

	if err := r.Client.Status().Update(ctx, kpkg); err != nil {
		r.Log.Error(err, "update status err")
		return reconcile.Result{}, nil
	}

	return reconcile.Result{}, nil
}

func (r *KubePkgReconciler) ensureManifest(ctx context.Context, kpkg *kubepkgv1alpha1.KubePkg, key string, o client.Object) error {
	gvk := o.GetObjectKind().GroupVersionKind()

	if err := r.setControllerReference(kpkg, o); err != nil {
		return err
	}

	if kpkg.Status.Statuses == nil {
		kpkg.Status.Statuses = map[string]interface{}{}
	}

	if err := r.Client.Patch(ctx, o, client.Apply, FieldOwner); err != nil {
		kpkg.Status.Statuses[key] = map[string]string{
			"$apply": err.Error(),
		}
		return err
	}

	live, err := kubeutil.NewForGroupVersionKind(gvk)
	if err != nil {
		return err
	}

	if err := r.Client.Get(ctx, client.ObjectKeyFromObject(o), live); err == nil {
		if u, ok := live.(*unstructured.Unstructured); ok {
			if status, ok := u.Object["status"]; ok {
				kpkg.Status.Statuses[key] = status
			}
		}
	}

	return nil
}

func (r *KubePkgReconciler) setControllerReference(kpkg *kubepkgv1alpha1.KubePkg, o metav1.Object) error {
	// must in small namespace
	o.SetNamespace(kpkg.Namespace)

	// bind controller
	return controllerutil.SetControllerReference(kpkg, o, r.Scheme)
}
