package containerregistry

import (
	"context"
	"fmt"
	"github.com/octohelm/kubepkg/pkg/httputil"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/go-logr/logr"

	"github.com/distribution/distribution/v3"
	"github.com/distribution/distribution/v3/configuration"
	"github.com/distribution/distribution/v3/registry/handlers"
	regsitrymiddleware "github.com/distribution/distribution/v3/registry/middleware/registry"
	"github.com/octohelm/kubepkg/internal/version"
)

func Serve(ctx context.Context, c *Configuration) error {
	l := logr.FromContextOrDiscard(ctx)

	cr, err := c.New(ctx)
	if err != nil {
		return err
	}

	_ = regsitrymiddleware.Register("custom", func(ctx context.Context, registry distribution.Namespace, options map[string]interface{}) (distribution.Namespace, error) {
		return cr, nil
	})

	app := handlers.NewApp(WithLogger(ctx, l), &configuration.Configuration{
		// just hack
		Storage: configuration.Storage{"filesystem": map[string]interface{}{
			"rootdirectory": c.StorageRoot,
		}},
		Middleware: map[string][]configuration.Middleware{
			"registry": {{
				Name: "custom",
			}},
		},
	})

	s := &http.Server{}

	s.Addr = c.RegistryAddr

	s.Handler = httputil.LogHandler(logr.FromContextOrDiscard(ctx))(enableMirrors(app))

	go func() {
		l.Info(fmt.Sprintf("registry@%s serve on %s (%s/%s)", version.Version, s.Addr, runtime.GOOS, runtime.GOARCH))
		if c.Proxy != nil {
			l.Info(fmt.Sprintf("proxy fallback %s enabled", c.Proxy.RemoteURL))
		}
		if err := s.ListenAndServe(); err != nil {
			l.Error(err, "")
		}
	}()

	stopCh := make(chan os.Signal, 1)
	signal.Notify(stopCh, os.Interrupt, syscall.SIGTERM)
	<-stopCh

	timeout := 10 * time.Second

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	return s.Shutdown(ctx)
}
