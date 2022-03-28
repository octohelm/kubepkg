package cmd

import (
	"context"
	"os"

	"github.com/go-logr/logr"
	"github.com/go-logr/zapr"
	"github.com/octohelm/kubepkg/pkg/containerregistry"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	ctrl "sigs.k8s.io/controller-runtime"
)

func NewLogger(lvl int) (l logr.Logger) {
	defer func() {
		ctrl.SetLogger(l)
	}()

	return zapr.NewLoggerWithOptions(
		func(opts ...zap.Option) *zap.Logger {
			if os.Getenv("GOENV") == "DEV" {
				l, _ := zap.NewDevelopment(opts...)
				return l
			}
			l, _ := zap.NewProduction(opts...)
			return l
		}(zap.IncreaseLevel(zap.NewAtomicLevelAt(zapcore.Level(lvl)))),
	)
}

type VerboseFlags struct {
	V int `flag:"verbose,v" desc:"verbose level"`
}

func (v VerboseFlags) PreRun(ctx context.Context) context.Context {
	if v.V > 0 {
		return containerregistry.WithLogger(ctx, NewLogger(-v.V))
	}
	return containerregistry.WithLogger(ctx, NewLogger(0))
}

type Storage struct {
	Root string `flag:"storage-root,w" default:".tmp/kubepkg" env:"KUBEPKG_STORAGE_ROOT" desc:"storage dir root"`
}

type RemoteRegistry struct {
	Endpoint string `flag:"remote-registry-endpoint" default:"" env:"KUBEPKG_REMOTE_REGISTRY_ENDPOINT" desc:"remote container registry endpoint"`
	Username string `flag:"remote-registry-username" default:"" env:"KUBEPKG_REMOTE_REGISTRY_USERNAME" desc:"remote container registry username"`
	Password string `flag:"remote-registry-password" default:"" env:"KUBEPKG_REMOTE_REGISTRY_PASSWORD" desc:"remote container registry password"`
}
