package containerregistry

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/distribution/distribution/v3"
	"github.com/distribution/distribution/v3/configuration"
	dcontext "github.com/distribution/distribution/v3/context"
	"github.com/distribution/distribution/v3/registry/handlers"
	regsitrymiddleware "github.com/distribution/distribution/v3/registry/middleware/registry"
	"github.com/octohelm/kubepkg/internal/version"
)

func Serve(ctx context.Context, c *Configuration) error {
	l := dcontext.GetLogger(ctx)

	cr, err := c.New(ctx)
	if err != nil {
		return err
	}

	s := &http.Server{}

	s.Addr = fmt.Sprintf(":%d", c.RegistryPort)

	_ = regsitrymiddleware.Register("custom", func(ctx context.Context, registry distribution.Namespace, options map[string]interface{}) (distribution.Namespace, error) {
		return cr, nil
	})

	app := handlers.NewApp(ctx, &configuration.Configuration{
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

	s.Handler = enableMirrors(app)

	go func() {
		l.Infof("registry@%s serve on %s (%s/%s)", version.Version, s.Addr, runtime.GOOS, runtime.GOARCH)
		if c.Proxy != nil {
			l.Infof("proxy fallback %s enabled", c.Proxy.RemoteURL)
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
