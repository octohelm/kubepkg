package cmd

import (
	"context"
	"fmt"

	"github.com/go-logr/logr"
	"github.com/octohelm/kubepkg/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/containerregistry"
	"github.com/octohelm/kubepkg/pkg/ioutil"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
)

func init() {
	app.Add(&Save{})
}

type SaveFlags struct {
	ForceResolve bool     `flag:"force-resolve" desc:"ignore image locked sha256 digest"`
	Output       string   `flag:"output,o" desc:"output path for kubepkg.tgz"`
	Platforms    []string `flag:"platform" default:"linux/amd64,linux/arm64" desc:"supported platforms"`
	Storage
	RemoteRegistry
}

type Save struct {
	cli.Name `args:"KUBEPKG_MANIFEST" desc:"Create kubepkg.tgz from kubepkg manifest"`
	SaveFlags
	VerboseFlags
}

func (s *Save) Run(ctx context.Context, args []string) error {
	l := logr.FromContextOrDiscard(ctx)
	ctx = containerregistry.WithLogger(ctx, l)

	kpkg, err := kubepkg.Load(args[0])
	if err != nil {
		return err
	}

	c := containerregistry.Configuration{}

	c.StorageRoot = s.Storage.Root
	c.Proxy = &containerregistry.Proxy{
		RemoteURL: s.Endpoint,
		Username:  s.Username,
		Password:  s.Password,
	}

	cr, err := c.New(ctx)
	if err != nil {
		return err
	}

	dr := kubepkg.NewDigestResolver(cr)
	p := kubepkg.NewPacker(cr)

	tgz, err := ioutil.CreateOrOpen(s.Output)
	if err != nil {
		return err
	}
	defer tgz.Close()

	kubepkg.AnnotationPlatforms(kpkg, s.Platforms)

	if s.ForceResolve {
		for k := range kpkg.Spec.Images {
			kpkg.Spec.Images[k] = ""
		}
	}

	resolved, err := dr.Resolve(ctx, kpkg)
	if err != nil {
		return err
	}

	d, err := p.TgzTo(ctx, resolved, tgz)
	if err != nil {
		return err
	}

	l.Info(
		fmt.Sprintf("%s generated.", s.Output),
		"digest", d,
	)

	return nil
}
