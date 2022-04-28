package cmd

import (
	"context"

	"github.com/innoai-tech/infra/pkg/cli"
	kubepkgv1alpha1 "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubepkg/agent"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	"k8s.io/apimachinery/pkg/runtime"
	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

func init() {
	cli.Add(serve, &Agent{})
}

type AgentFlags struct {
	Storage

	AgentID    string   `flag:"agent-id" default:"dev" env:"KUBEPKG_AGENT_ID" desc:"output path for kubepkg.tgz"`
	Platforms  []string `flag:"platform" env:"KUBEPKG_PLATFORMS" default:"linux/amd64,linux/arm64" desc:"supported platforms"`
	Addr       string   `flag:"addr" env:"AGENT_ADDR" default:":36060" desc:"The address the server endpoint binds to"`
	KubeConfig string   `flag:"kubeconfig" env:"KUBECONFIG" desc:"Paths to a kubeconfig. Only required if out-of-cluster."`
}

type Agent struct {
	cli.Name `desc:"registry"`
	AgentFlags
	VerboseFlags
}

func (s *Agent) Run(ctx context.Context) error {
	kc, err := kubeutil.GetConfig(s.KubeConfig)
	if err != nil {
		return err
	}

	scheme := runtime.NewScheme()

	utilruntime.Must(clientgoscheme.AddToScheme(scheme))
	utilruntime.Must(kubepkgv1alpha1.AddToScheme(scheme))

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
