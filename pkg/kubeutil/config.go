package kubeutil

import (
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

var loadInClusterConfig = rest.InClusterConfig

func GetConfig(kubeConfigPath string) (*rest.Config, error) {
	cfg, err := LoadConfig(kubeConfigPath)
	if err != nil {
		return nil, err
	}
	if cfg.QPS == 0.0 {
		cfg.QPS = 20.0
		cfg.Burst = 30.0
	}
	return cfg, nil
}

func LoadConfig(kubeConfigPath string) (*rest.Config, error) {
	if len(kubeConfigPath) == 0 {
		if c, err := loadInClusterConfig(); err == nil {
			return c, nil
		}
	}
	cc, err := clientcmd.LoadFromFile(kubeConfigPath)
	if err != nil {
		return nil, err
	}
	return clientcmd.NewDefaultClientConfig(*cc, nil).ClientConfig()
}
