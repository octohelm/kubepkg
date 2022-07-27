package containerregistry

import (
	"context"
	"net/url"

	"github.com/distribution/distribution/v3"
	"github.com/distribution/distribution/v3/configuration"
	"github.com/distribution/distribution/v3/registry/storage"
	"github.com/distribution/distribution/v3/registry/storage/driver"
	"github.com/distribution/distribution/v3/registry/storage/driver/factory"
	_ "github.com/distribution/distribution/v3/registry/storage/driver/filesystem"
	"github.com/docker/libtrust"
	"github.com/octohelm/kubepkg/pkg/containerregistry/proxy"
)

type Proxy = configuration.Proxy

type Storage struct {
	// Storage dir root
	Root string `flag:",omitempty,volume"`
}

func (s *Storage) SetDefaults() {
	if s.Root == "" {
		s.Root = "/etc/kubepkg"
	}
}

type Configuration struct {
	StorageRoot string

	RegistryAddr     string
	RegistryBaseHost string

	Proxy *Proxy
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

	registryBaseHost := c.RegistryBaseHost

	if registryBaseHost == "" && c.Proxy != nil {
		u, _ := url.Parse(c.Proxy.RemoteURL)
		registryBaseHost = u.Host
	}

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
		return &namespace{baseHost: registryBaseHost, Namespace: pr}, nil
	}

	return &namespace{baseHost: registryBaseHost, Namespace: r}, nil
}

func (c Configuration) WithoutProxy() *Configuration {
	c.Proxy = nil
	return &c
}
