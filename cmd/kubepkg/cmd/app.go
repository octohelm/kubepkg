package cmd

import (
	"context"
	"os"

	"github.com/octohelm/kubepkg/internal/version"
	"github.com/octohelm/kubepkg/pkg/cli"
)

var app = cli.NewApp("kubepkg", version.Version)

func Run(ctx context.Context) error {
	return app.Run(ctx, os.Args)
}
