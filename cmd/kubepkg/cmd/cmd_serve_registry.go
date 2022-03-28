package cmd

import (
	"context"

	"github.com/octohelm/kubepkg/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/containerregistry"
)

func init() {
	serve.Add(&Registry{})
}

type RegistryFlags struct {
	Storage
	RemoteRegistry
	Addr string `flag:"addr" env:"REGISTRY_ADDR" default:":5000" desc:"The address the server endpoint binds to"`
}

type Registry struct {
	cli.Name `desc:"registry"`
	RegistryFlags
	VerboseFlags
}

func (s *Registry) Run(ctx context.Context, args []string) error {
	c := &containerregistry.Configuration{}

	c.StorageRoot = s.Storage.Root
	c.RegistryAddr = s.Addr

	if s.Endpoint != "" {
		c.Proxy = &containerregistry.Proxy{
			RemoteURL: s.Endpoint,
			Username:  s.Username,
			Password:  s.Password,
		}
	}

	return containerregistry.Serve(ctx, c)
}
