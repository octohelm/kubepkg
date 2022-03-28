package main

import (
	"context"

	"github.com/octohelm/kubepkg/pkg/containerregistry"
)

func main() {
	c := containerregistry.FromEnv()

	if err := containerregistry.Serve(context.Background(), c); err != nil {
		panic(err)
	}
}
