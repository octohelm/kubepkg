package cmd

import (
	"context"

	releasev1alpha1 "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/kubepkg/agent"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	"k8s.io/apimachinery/pkg/runtime"
	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

func init() {
	serve.Add(&Agent{})
}

type AgentFlags struct {
	Storage

	AgentID    string   `flag:"cluster-id" env:"KUBEPKG_AGENT_ID" desc:"output path for kubepkg.tgz"`
	Platforms  []string `flag:"platform" env:"KUBEPKG_PLATFORMS"  default:"linux/amd64,linux/arm64" desc:"supported platforms"`
	Addr       string   `flag:"addr" default:":36060" desc:"The address the server endpoint binds to"`
	KubeConfig string   `flag:"kubeconfig" env:"KUBECONFIG" desc:"Paths to a kubeconfig. Only required if out-of-cluster."`
}

type Agent struct {
	cli.Name `desc:"registry"`
	AgentFlags
}

func (s *Agent) Run(ctx context.Context, args []string) error {
	kc, err := kubeutil.GetConfig(s.KubeConfig)
	if err != nil {
		return err
	}

	scheme := runtime.NewScheme()

	utilruntime.Must(clientgoscheme.AddToScheme(scheme))
	utilruntime.Must(releasev1alpha1.AddToScheme(scheme))

	c, err := client.New(kc, client.Options{Scheme: scheme})
	if err != nil {
		return err
	}

	opt := agent.ServeOptions{}
	opt.StorageRoot = s.Storage.Root
	opt.AgentID = s.AgentID
	opt.SupportedPlatforms = s.Platforms
	opt.Addr = s.Addr

	return agent.NewAgent(c, opt).Serve(ctx)
}
