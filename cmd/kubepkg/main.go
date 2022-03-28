package main

import (
	"context"
	"os"

	"github.com/octohelm/kubepkg/cmd/kubepkg/cmd"
	ctrl "sigs.k8s.io/controller-runtime"
)

func init() {
}

func main() {
	if err := cmd.Run(context.Background()); err != nil {
		ctrl.Log.Error(err, "")
		os.Exit(1)
	}
}
