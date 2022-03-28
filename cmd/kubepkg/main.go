package main

import (
	"context"
	"os"

	"github.com/go-logr/logr"
	"github.com/octohelm/kubepkg/cmd/kubepkg/cmd"
	"go.uber.org/zap/zapcore"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/log/zap"
)

func init() {
	ctrl.SetLogger(zap.New(
		zap.UseDevMode(os.Getenv("GOENV") == "DEV"),
		func(opt *zap.Options) {
			opt.TimeEncoder = zapcore.ISO8601TimeEncoder
		},
	))
}

func main() {
	ctx := logr.NewContext(context.Background(), ctrl.Log)

	if err := cmd.Run(ctx); err != nil {
		ctrl.Log.Error(err, "")
		os.Exit(1)
	}
}
