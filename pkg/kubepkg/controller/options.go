package controller

import (
	"context"

	"sigs.k8s.io/controller-runtime/pkg/cache"

	"github.com/go-courier/logr"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg"
	kubepkgv1alpha1 "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	kubeutilclient "github.com/octohelm/kubepkg/pkg/kubeutil/client"
	"github.com/octohelm/kubepkg/pkg/logutil"
	"github.com/pkg/errors"
	"k8s.io/apimachinery/pkg/runtime"
	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	ctrl "sigs.k8s.io/controller-runtime"
)

type HostOptions struct {
	// Cluster Ingress Gateway template
	IngressGateway []string `flag:",omitempty"`
}

type Operator struct {
	HostOptions

	// Watch namespace
	WatchNamespace string `flag:",omitempty"`
	// The address the metric endpoint binds to
	MetricsAddr string `flag:",omitempty"`
	// Enable leader election for controller manager.
	EnableLeaderElection bool `flag:",omitempty"`

	cancel func()
}

func (s *Operator) Run(ctx context.Context) error {
	if err := kubeutil.ApplyCRDs(ctx, kubeutilclient.KubeConfigFromClient(kubeutilclient.ClientFromContext(ctx)), kubepkg.CRDs...); err != nil {
		return errors.Wrap(err, "unable to create crds")
	}
	logr.FromContext(ctx).Info("crds created.")
	return nil
}

func (s *Operator) Serve(ctx context.Context) error {
	scheme := runtime.NewScheme()

	utilruntime.Must(clientgoscheme.AddToScheme(scheme))
	utilruntime.Must(kubepkgv1alpha1.AddToScheme(scheme))

	ctrlOpt := ctrl.Options{
		Logger:           logutil.GoLogrFromContext(ctx),
		Scheme:           scheme,
		LeaderElectionID: "a2v1z20az.octohelm.tech",
		LeaderElection:   s.EnableLeaderElection,
	}

	ctrlOpt.Metrics.BindAddress = s.MetricsAddr

	if s.WatchNamespace != "" {
		ctrlOpt.Cache.DefaultNamespaces = map[string]cache.Config{
			s.WatchNamespace: {},
		}
	}

	mgr, err := ctrl.NewManager(kubeutilclient.KubeConfigFromClient(kubeutilclient.ClientFromContext(ctx)), ctrlOpt)
	if err != nil {
		return err
	}

	if err := SetupWithManager(mgr, s.HostOptions); err != nil {
		return errors.Wrap(err, "unable to create controller")
	}

	cc, cancel := context.WithCancel(ctx)
	s.cancel = cancel

	return mgr.Start(cc)
}

func (o *Operator) Shutdown(ctx context.Context) error {
	if o.cancel != nil {
		o.cancel()
	}
	return nil
}
