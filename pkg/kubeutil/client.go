package kubeutil

import (
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
}

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
