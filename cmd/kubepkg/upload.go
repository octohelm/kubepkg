package main

import (
	"context"
	"fmt"
	"io"
	"os"

	"github.com/distribution/distribution/v3/reference"
	"github.com/go-courier/logr"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubepkg"

	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/containerregistry"
	"github.com/octohelm/kubepkg/pkg/containerregistry/client"
	"github.com/octohelm/kubepkg/pkg/logutil"
)

func init() {
	cli.AddTo(App, &Upload{})
}

// Upload kubepkg.tgz to container registry
type Upload struct {
	cli.C
	logutil.Logger
	Uploader
}

type Uploader struct {
	KubeTgzFile string `arg:""`

	Registry       containerregistry.RemoteRegistry
	KeepOriginHost bool `flag:",omitempty"`

	ManifestDumper
}

func (s *Uploader) Run(ctx context.Context) error {
	kubePkgTgz, err := os.Open(s.KubeTgzFile)
	if err != nil {
		return err
	}
	defer kubePkgTgz.Close()

	c := &client.Client{
		Registry:       s.Registry,
		KeepOriginHost: s.KeepOriginHost,
	}

	l := logr.FromContext(ctx)

	kubepkgs, err := kubepkg.KubeTgzRange(ctx, kubePkgTgz, func(ctx context.Context, dm *v1alpha1.DigestMeta, br io.Reader, i, total int) error {
		repoName, err := reference.WithName(dm.Name)
		if err != nil {
			return err
		}
		repo, err := c.Repository(ctx, repoName)
		if err != nil {
			return err
		}
		l.Info(fmt.Sprintf("uploading %s %s@%s", dm.Type, c.FixedNamed(repoName), dm.Digest))
		return kubepkg.ImportDigest(ctx, repo, dm, br, true)
	})
	if err != nil {
		return err
	}

	return s.ManifestDumper.DumpManifests(c.UpdateImages(kubepkgs))
}
