package cmd

import (
	"context"

	"github.com/octohelm/kubepkg/pkg/cli"
)

var serve = &Serve{}

func init() {
	app.Add(serve)
}

type Serve struct {
	cli.Name `desc:"serve"`
}

func (s *Serve) Run(ctx context.Context, args []string) error {
	return nil
}
