package main

import (
	"flag"
	"os"

	"github.com/octohelm/kubepkg/cmd/kubepkg-operator/controller"
	"github.com/octohelm/kubepkg/internal/version"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg"
	releasev1alpha1 "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	"github.com/pkg/errors"
	"k8s.io/apimachinery/pkg/runtime"
	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/log/zap"
)

var (
	scheme = runtime.NewScheme()
)

func init() {
	utilruntime.Must(clientgoscheme.AddToScheme(scheme))
	utilruntime.Must(releasev1alpha1.AddToScheme(scheme))
}

func main() {
	ctrl.SetLogger(zap.New(zap.UseDevMode(os.Getenv("GOENV") == "DEV")))

	ctrlOpt := ctrl.Options{
		Scheme:           scheme,
		LeaderElectionID: "a2v1z20az.octohelm.tech",
		Logger:           ctrl.Log.WithValues("kubepkg-operator", version.Version),
	}

	flag.StringVar(&ctrlOpt.Namespace, "watch-namespace", os.Getenv("WATCH_NAMESPACE"), "watch namespace")
	flag.StringVar(&ctrlOpt.MetricsBindAddress, "metrics-addr", ":8080", "The address the metric endpoint binds to.")
	flag.BoolVar(&ctrlOpt.LeaderElection, "enable-leader-election", false, "Enable leader election for controller manager. Enabling this will ensure there is only one active controller manager.")

	flag.Parse()

	if err := startOperator(ctrlOpt); err != nil {
		ctrl.Log.WithName("setup").Error(err, "")
	}
}

func startOperator(ctrlOpt ctrl.Options) error {
	restConfig := ctrl.GetConfigOrDie()

	if err := kubeutil.ApplyCRDs(restConfig, kubepkg.CRDs...); err != nil {
		return errors.Wrap(err, "unable to create crds")
	} else {
		ctrl.Log.WithName("crd").Info("crds created")
	}

	mgr, err := ctrl.NewManager(restConfig, ctrlOpt)
	if err != nil {
		return errors.Wrap(err, "unable to start manager")
	}

	if err := controller.SetupWithManager(mgr); err != nil {
		return errors.Wrap(err, "unable to create controller")
	}

	return mgr.Start(ctrl.SetupSignalHandler())
}
