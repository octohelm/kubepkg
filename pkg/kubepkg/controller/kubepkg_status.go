package controller

import (
	"context"
	"fmt"
	"strings"

	"github.com/stretchr/objx"
	appsv1 "k8s.io/api/apps/v1"
	"k8s.io/apimachinery/pkg/labels"

	corev1 "k8s.io/api/core/v1"

	"github.com/octohelm/kubepkg/pkg/annotation"
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
	HostOptions HostOptions
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

	specStatus := &kubepkgv1alpha1.Status{}

	if len(r.HostOptions.IngressGateway) > 0 {
		kubeutil.Annotate(kpkg, annotation.IngressGateway, strings.Join(r.HostOptions.IngressGateway, ","))
	}

	manifests, err := manifest.ExtractComplete(kpkg)
	if err != nil {
		l.Error(err, "extra manifests failed")
		return reconcile.Result{}, nil
	}

	for key := range manifests {
		o := manifests[key]

		// skip unsupported
		if !IsSupportedGroupKind(o) {
			specStatus.AppendResourceStatus(o.GetName(), o.GetObjectKind().GroupVersionKind(), map[string]any{
				"status": "False",
				"reason": "UnsupportedManifest",
			})
			continue
		}

		if err := r.collectManifestStatus(ctx, specStatus, o); err != nil {
			return reconcile.Result{}, nil
		}
	}

	if err := r.GetAPIReader().Get(ctx, request.NamespacedName, kpkg); err != nil {
		if apierrors.IsNotFound(err) {
			return reconcile.Result{}, nil
		}
		return reconcile.Result{}, err
	}

	kpkg.Status = specStatus

	if err := cc.Status().Update(ctx, kpkg); err != nil {
		l.Error(err, "update status err")
		return reconcile.Result{}, nil
	}
	return reconcile.Result{}, nil
}

func (r *KubePkgStatusReconciler) collectManifestStatus(ctx context.Context, specStatus *kubepkgv1alpha1.Status, o client.Object) error {
	gvk := o.GetObjectKind().GroupVersionKind()

	live, err := kubeutil.NewForGroupVersionKind(gvk)
	if err != nil {
		return err
	}

	if err := r.GetAPIReader().Get(ctx, client.ObjectKeyFromObject(o), live); err != nil {
		return err
	}

	if u, ok := live.(*unstructured.Unstructured); ok {
		if gvk == corev1.SchemeGroupVersion.WithKind("ConfigMap") && strings.HasPrefix(u.GetName(), "endpoint-") {
			if data, ok := u.Object["data"]; ok {
				if endpoints, ok := data.(map[string]any); ok {
					specStatus.Endpoint = map[string]string{}

					for k := range endpoints {
						if v, ok := endpoints[k].(string); ok {
							specStatus.Endpoint[k] = v
						}
					}
				}
			}
		}

		manifestStatus := map[string]any{}

		m := objx.Map(u.Object)

		if v := m.Get("status"); v.IsObjxMap() {
			manifestStatus = v.MSI()
		}

		if gvk.Group == appsv1.SchemeGroupVersion.Group {
			if spec := m.Get("spec"); spec.IsObjxMap() {
				if selector := spec.ObjxMap().Get("selector"); selector.IsObjxMap() {
					if matchLabels := selector.ObjxMap().Get("matchLabels"); matchLabels.IsObjxMap() {
						podLabels := map[string]string{}
						for k, v := range matchLabels.ObjxMap() {
							if value := v.(string); ok {
								podLabels[k] = value
							}
						}
						podStatuses, err := r.collectContainerStatus(ctx, o.GetNamespace(), podLabels, manifestStatus)
						if err != nil {
							return err
						}
						manifestStatus["podStatuses"] = podStatuses
					}
				}
			}
		}

		specStatus.AppendResourceStatus(o.GetName(), gvk, manifestStatus)
	}

	return nil
}

func (r *KubePkgStatusReconciler) collectContainerStatus(ctx context.Context, namespace string, matchLabels map[string]string, status map[string]any) ([]corev1.PodStatus, error) {
	podList := &corev1.PodList{}

	if err := r.GetClient().List(
		ctx,
		podList,
		client.InNamespace(namespace),
		client.MatchingLabelsSelector{Selector: labels.SelectorFromSet(matchLabels)},
	); err != nil {
		return nil, err
	}

	podContainerStatuses := make([]corev1.PodStatus, len(podList.Items))

	for i := range podList.Items {
		podContainerStatuses[i] = podList.Items[i].Status
	}

	return podContainerStatuses, nil
}
