package cmd

import (
	"context"
	"github.com/octohelm/kubepkg/pkg/kubepkg/controller"

	"github.com/go-logr/logr"
	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg"
	kubepkgv1alpha1 "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	"github.com/pkg/errors"
	"k8s.io/apimachinery/pkg/runtime"
	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	ctrl "sigs.k8s.io/controller-runtime"
)

func init() {
	cli.Add(serve, &Operator{})
}

type OperatorFlags struct {
	WatchNamespace       string `flag:"watch-namespace" env:"WATCH_NAMESPACE" desc:"Watch namespace"`
	MetricsAddr          string `flag:"metrics-addr" default:":8080" desc:"The address the metric endpoint binds to"`
	EnableLeaderElection bool   `flag:"enable-leader-election" desc:"Enable leader election for controller manager."`
	KubeConfig           string `flag:"kubeconfig" env:"KUBECONFIG" desc:"Paths to a kubeconfig. Only required if out-of-cluster."`
	controller.Options
}

type Operator struct {
	cli.Name `desc:"registry"`
	OperatorFlags
	VerboseFlags
}

func (s *Operator) Run(ctx context.Context) error {
	scheme := runtime.NewScheme()

	utilruntime.Must(clientgoscheme.AddToScheme(scheme))
	utilruntime.Must(kubepkgv1alpha1.AddToScheme(scheme))

	ctrlOpt := ctrl.Options{
		Logger: logr.FromContextOrDiscard(ctx),
		Scheme: scheme,

		LeaderElectionID:   "a2v1z20az.octohelm.tech",
		LeaderElection:     s.EnableLeaderElection,
		Namespace:          s.WatchNamespace,
		MetricsBindAddress: s.MetricsAddr,
	}

	kc, err := kubeutil.GetConfig(s.KubeConfig)
	if err != nil {
		return err
	}

	mgr, err := ctrl.NewManager(kc, ctrlOpt)
	if err != nil {
		return err
	}

	return startOperator(ctx, mgr, s.Options)
}

func startOperator(ctx context.Context, mgr ctrl.Manager, options controller.Options) error {
	if err := kubeutil.ApplyCRDs(ctx, mgr.GetConfig(), kubepkg.CRDs...); err != nil {
		return errors.Wrap(err, "unable to create crds")
	} else {
		ctrl.Log.WithName("crd").Info("crds created")
	}
	if err := controller.SetupWithManager(mgr, options); err != nil {
		return errors.Wrap(err, "unable to create controller")
	}
	return mgr.Start(ctrl.SetupSignalHandler())
}
