package controller

import (
	controllerRuntime "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/manager"
)

func SetupWithManager(mgr controllerRuntime.Manager) error {
	return SetupReconcilerWithManager(
		mgr,
		&KubePkgReconciler{
			APIReader: mgr.GetAPIReader(),
			Client:    mgr.GetClient(),
			Scheme:    mgr.GetScheme(),
			Log:       mgr.GetLogger().WithName("controllers").WithName("KubePkg"),
		},
	)
}

type Reconciler interface {
	SetupWithManager(mgr controllerRuntime.Manager) error
}

func SetupReconcilerWithManager(mgr manager.Manager, reconcilers ...Reconciler) error {
	for i := range reconcilers {
		if err := reconcilers[i].SetupWithManager(mgr); err != nil {
			return err
		}
	}
	return nil
}
