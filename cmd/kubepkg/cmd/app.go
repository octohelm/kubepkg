package cmd

import (
	"context"
	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/version"
	"os"
)

var app = cli.NewApp("kubepkg", version.FullVersion())

func Run(ctx context.Context) error {
	return cli.Execute(ctx, app, os.Args[1:])
}
