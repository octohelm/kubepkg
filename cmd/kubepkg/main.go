package main

import (
	"context"
	"os"

	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/version"
)

var App = cli.NewApp("kubepkg", version.Version(), cli.WithImageNamespace("ghcr.io/octohelm"))

var Serve = cli.AddTo(App, &struct {
	cli.C `name:"serve"`
}{})

func main() {
	if err := cli.Execute(context.Background(), App, os.Args[1:]); err != nil {
		os.Exit(1)
	}
}
