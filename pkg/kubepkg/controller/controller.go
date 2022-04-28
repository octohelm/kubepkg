package controller

import (
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

var FieldOwner = client.FieldOwner("kubepkg")

func SetupWithManager(mgr ctrl.Manager, options Options) error {
	reconcilers := []Reconciler{
		&ServiceReconciler{
			HostOptions: options.HostOptions,
		},
		&KubePkgApplyReconciler{},
		&KubePkgStatusReconciler{},
		&ConfigMapReloadReconciler{},
		&SecretReloadReconciler{},
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
