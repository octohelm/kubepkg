package controller

import (
	"context"
	"fmt"
	"strings"

	"github.com/pkg/errors"

	"github.com/octohelm/kubepkg/pkg/annotation"
	kubepkgv1alpha1 "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubepkg/manifest"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/labels"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/builder"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	"sigs.k8s.io/controller-runtime/pkg/event"
	"sigs.k8s.io/controller-runtime/pkg/predicate"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"
)

type KubePkgApplyReconciler struct {
	ctrl.Manager
	HostOptions HostOptions
}

func (r *KubePkgApplyReconciler) SetupWithManager(mgr ctrl.Manager) error {
	r.Manager = mgr

	c := ctrl.NewControllerManagedBy(mgr).
		For(&kubepkgv1alpha1.KubePkg{}, builder.WithPredicates(predicate.Funcs{
			UpdateFunc: func(e event.UpdateEvent) bool {
				return e.ObjectNew.GetGeneration() != e.ObjectOld.GetGeneration()
			},
		}))

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

		c = c.Owns(u, builder.OnlyMetadata, builder.WithPredicates(predicate.Funcs{
			UpdateFunc: func(e event.UpdateEvent) bool {
				return e.ObjectNew.GetGeneration() != e.ObjectOld.GetGeneration()
			},
		}))
	}

	return c.Complete(r)
}

func (r *KubePkgApplyReconciler) Reconcile(ctx context.Context, request reconcile.Request) (ret reconcile.Result, err error) {
	l := r.GetLogger().WithValues("Reconcile", "Apply", "request", request.NamespacedName)

	kpkg := &kubepkgv1alpha1.KubePkg{}

	cc := r.GetClient()

	if err := cc.Get(ctx, request.NamespacedName, kpkg); err != nil {
		if apierrors.IsNotFound(err) {
			return reconcile.Result{}, nil
		}
		return reconcile.Result{}, err
	}

	l.Info(fmt.Sprintf("Applying %s.%s", kpkg.GetName(), kpkg.GetNamespace()))

	if len(r.HostOptions.IngressGateway) > 0 {
		kubeutil.Annotate(kpkg, annotation.IngressGateway, strings.Join(r.HostOptions.IngressGateway, ","))
	}

	defer func() {
		if err != nil {
			kpkg.Status = &kubepkgv1alpha1.Status{
				Resources: []map[string]any{
					{
						"apiVersion": kpkg.APIVersion,
						"kind":       kpkg.Kind,
						"status": map[string]any{
							"reason":  "InvalidSpec",
							"message": err.Error(),
						},
					},
				},
			}

			if err := cc.Status().Update(ctx, kpkg); err != nil {
				l.Error(err, "update status err")
			}
		}
	}()

	manifests, err := manifest.ExtractComplete(kpkg)
	if err != nil {
		return reconcile.Result{}, errors.Wrapf(err, "extra manifests failed")
	}

	for name := range manifests {
		o := manifests[name]

		// skip unsupported
		if !IsSupportedGroupKind(o) {
			l.Info(fmt.Sprintf("Got unsupported %s", o.GetObjectKind().GroupVersionKind()))
			continue
		}

		if err := r.patchExternalConfigMapOrSecretIfNeed(ctx, kpkg, o); err != nil {
			return reconcile.Result{}, errors.Wrapf(err, "%s `%s`: patch external configMaps failed", o.GetObjectKind().GroupVersionKind(), o.GetName())
		}

		if err := r.applyManifest(ctx, kpkg, o); err != nil {
			return reconcile.Result{}, errors.Wrapf(err, "%s `%s`: apply sub-manifest failed", o.GetObjectKind().GroupVersionKind(), o.GetName())
		}
	}

	return reconcile.Result{}, nil
}

func (r *KubePkgApplyReconciler) patchExternalConfigMapOrSecretIfNeed(ctx context.Context, kpkg *kubepkgv1alpha1.KubePkg, o client.Object) error {
	if v := kubeutil.GetAnnotate(o, annotation.ReloadConfigMap); v != "" {
		cms := &corev1.ConfigMapList{}
		s, _ := labels.Parse(fmt.Sprintf("%s in (%s)", annotation.LabelAppName, v))

		if err := r.GetClient().List(ctx, cms, client.InNamespace(kpkg.Namespace), client.MatchingLabelsSelector{
			Selector: s,
		}); err != nil {
			return err
		}

		for i := range cms.Items {
			cm := cms.Items[i]
			AnnotateHash(o, annotation.ConfigMapHashKey(cm.Name), manifest.StringDataHash(cm.Data))
		}
	}

	if v := kubeutil.GetAnnotate(o, annotation.ReloadSecret); v != "" {
		ss := &corev1.SecretList{}
		s, _ := labels.Parse(fmt.Sprintf("%s in (%s)", annotation.LabelAppName, v))

		if err := r.GetClient().List(ctx, ss, client.InNamespace(kpkg.Namespace), client.MatchingLabelsSelector{
			Selector: s,
		}); err != nil {
			return err
		}

		for i := range ss.Items {
			s := ss.Items[i]
			AnnotateHash(o, annotation.SecretHashKey(s.Name), manifest.DataHash(s.Data))
		}
	}

	return nil
}

func (r *KubePkgApplyReconciler) applyManifest(ctx context.Context, kpkg *kubepkgv1alpha1.KubePkg, o client.Object) error {
	if err := controllerutil.SetControllerReference(kpkg, o, r.GetScheme()); err != nil {
		return err
	}
	return Apply(ctx, r.GetClient(), o)
}
