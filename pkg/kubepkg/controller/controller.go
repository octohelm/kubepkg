package controller

import (
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

var FieldOwner = client.FieldOwner("kubepkg")

func SetupWithManager(mgr ctrl.Manager, hostOptions HostOptions) error {
	reconcilers := []Reconciler{
		&KubePkgApplyReconciler{
			HostOptions: hostOptions,
		},
		&KubePkgStatusReconciler{
			HostOptions: hostOptions,
		},
		&ConfigMapReloadReconciler{},
		&SecretReloadReconciler{},
		&ClusterInfoReconciler{},
	}
	for i := range reconcilers {
		if err := reconcilers[i].SetupWithManager(mgr); err != nil {
			return err
		}
	}
	return nil
}

type Reconciler interface {
	SetupWithManager(mgr ctrl.Manager) error
}
