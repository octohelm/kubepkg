package controller

import (
	"context"
	"fmt"
	"sort"
	"strings"

	corev1 "k8s.io/api/core/v1"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"
)

type ClusterInfoReconciler struct {
	ctrl.Manager
}

func (r *ClusterInfoReconciler) SetupWithManager(mgr ctrl.Manager) error {
	r.Manager = mgr

	return ctrl.NewControllerManagedBy(mgr).
		For(&corev1.Node{}).
		Complete(r)
}

func (r *ClusterInfoReconciler) Reconcile(ctx context.Context, request reconcile.Request) (reconcile.Result, error) {
	nodeList := &corev1.NodeList{}

	if err := r.GetClient().List(ctx, nodeList); err != nil {
		return reconcile.Result{}, err
	}

	machineID := ""
	platformSet := map[string]string{}

	for _, node := range nodeList.Items {
		if machineID == "" {
			if label, ok := node.Labels["node-role.kubernetes.io/control-plane"]; ok {
				if label == "true" {
					machineID = node.Status.NodeInfo.MachineID
				}
			}
		}

		platform := fmt.Sprintf("%s/%s", node.Status.NodeInfo.OperatingSystem, node.Status.NodeInfo.Architecture)
		platformSet[platform] = platform
	}

	platforms := make([]string, 0)
	for p := range platformSet {
		platforms = append(platforms, p)
	}
	sort.Strings(platforms)

	cm := &corev1.ConfigMap{}
	cm.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("ConfigMap"))
	cm.SetName("cluster-info")
	cm.SetNamespace("kube-system")

	cm.Data = map[string]string{
		"id":        machineID,
		"platforms": strings.Join(platforms, ","),
	}

	if err := Apply(ctx, r.GetClient(), cm); err != nil {
		return reconcile.Result{}, err
	}

	return reconcile.Result{}, nil
}
