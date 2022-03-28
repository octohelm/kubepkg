package containerregistry

import (
	"context"
	"net/url"
	"os"
	"strconv"

	"github.com/distribution/distribution/v3"
	"github.com/distribution/distribution/v3/configuration"
	"github.com/distribution/distribution/v3/registry/storage"
	"github.com/distribution/distribution/v3/registry/storage/driver"
	"github.com/distribution/distribution/v3/registry/storage/driver/factory"
	_ "github.com/distribution/distribution/v3/registry/storage/driver/filesystem"
	"github.com/docker/libtrust"
	"github.com/octohelm/kubepkg/pkg/containerregistry/proxy"
)

func getEnv(defaultValue string, keys ...string) string {
	for _, key := range keys {
		if v := os.Getenv(key); v != "" {
			return v
		}
	}
	return defaultValue
}

func FromEnv() *Configuration {
	c := Configuration{}

	c.StorageRoot = getEnv("", "STORAGE_ROOT")
	c.BaseHost = getEnv("", "BASE_HOST")
	c.RegistryPort, _ = strconv.Atoi(getEnv("6060", "REGISTRY_PORT"))

	if proxyEndpoint := getEnv("", "PROXY_ENDPOINT", "CUSTOM_DOCKER_ENDPOINT"); proxyEndpoint != "" {
		c.Proxy = &Proxy{
			RemoteURL: proxyEndpoint,
			Username:  getEnv("", "PROXY_USERNAME", "CUSTOM_DOCKER_USERNAME"),
			Password:  getEnv("", "PROXY_PASSWORD", "CUSTOM_DOCKER_PASSWORD"),
		}

		if c.BaseHost == "" {
			u, _ := url.Parse(proxyEndpoint)
			c.BaseHost = u.Host
		}
	}

	return &c
}

type Proxy = configuration.Proxy

type Configuration struct {
	BaseHost     string
	StorageRoot  string
	Proxy        *Proxy
	RegistryPort int
}

func (c *Configuration) MustStorage() driver.StorageDriver {
	d, err := factory.Create("filesystem", map[string]interface{}{
		"rootdirectory": c.StorageRoot,
	})

	if err != nil {
		panic(err)
	}

	return d
}

func (c *Configuration) New(ctx context.Context) (distribution.Namespace, error) {
	ds := c.MustStorage()

	k, err := libtrust.GenerateECP256PrivateKey()
	if err != nil {
		return nil, err
	}

	r, err := storage.NewRegistry(ctx, ds, storage.Schema1SigningKey(k))
	if err != nil {
		return nil, err
	}

	if c.Proxy != nil {
		pr, err := proxy.NewProxyFallbackRegistry(ctx, r, ds, *c.Proxy)
		if err != nil {
			return nil, err
		}
		return &namespace{baseHost: c.BaseHost, Namespace: pr}, nil
	}

	return &namespace{baseHost: c.BaseHost, Namespace: r}, nil
}

func (c Configuration) WithoutProxy() *Configuration {
	return &Configuration{
		StorageRoot: c.StorageRoot,
	}
}
