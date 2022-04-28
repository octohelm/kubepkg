package cmd

import (
	"github.com/innoai-tech/infra/pkg/cli"
)

var serve = cli.Add(app, &Serve{})

type Serve struct {
	cli.Name `desc:"serve"`
}
