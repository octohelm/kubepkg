package kubeutil

import (
	"context"

	kubepkgv1alpha1 "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	contextx "github.com/octohelm/x/context"
	"k8s.io/apimachinery/pkg/runtime"
	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

var (
	scheme = runtime.NewScheme()
)

func init() {
	utilruntime.Must(clientgoscheme.AddToScheme(scheme))
	utilruntime.Must(kubepkgv1alpha1.AddToScheme(scheme))
}

var FieldOwner = client.FieldOwner("kubepkg")

func NewClient(kubeConfigPath string) (client.Client, error) {
	kubeConfig, err := loadConfig(kubeConfigPath)
	if err != nil {
		return nil, err
	}

	c, err := client.New(kubeConfig, client.Options{
		Scheme: scheme,
	})
	if err != nil {
		return nil, err
	}

	return &clientWithConfig{Client: c, config: kubeConfig}, nil
}

type clientWithConfig struct {
	client.Client
	config *rest.Config
}

func (c *clientWithConfig) KubeConfig() *rest.Config {
	return c.config
}

func KubeConfigFromClient(c client.Client) *rest.Config {
	if can, ok := c.(interface{ KubeConfig() *rest.Config }); ok {
		return can.KubeConfig()
	}
	return nil
}

type clientCtx struct {
}

func ClientFromContext(ctx context.Context) client.Client {
	return ctx.Value(clientCtx{}).(client.Client)
}

func ContextWithClient(ctx context.Context, c client.Client) context.Context {
	return contextx.WithValue(ctx, clientCtx{}, c)
}

type KubeClient struct {
	// Paths to a kubeconfig. Only required if out-of-cluster.
	Kubeconfig string `flag:",omitempty"`

	c client.Client
}

func (c *KubeClient) Init(ctx context.Context) error {
	if c.c == nil {
		cc, err := NewClient(c.Kubeconfig)
		if err != nil {
			return err
		}
		c.c = cc
	}

	return nil
}

func (c *KubeClient) InjectContext(ctx context.Context) context.Context {
	return ContextWithClient(ctx, c.c)
}
