package agent

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"strings"
	"syscall"
	"time"

	"github.com/distribution/distribution/v3"
	"github.com/octohelm/kubepkg/pkg/containerregistry"
	"github.com/octohelm/kubepkg/pkg/kubepkg/mime"
	"github.com/opencontainers/go-digest"

	"github.com/go-logr/logr"
	"github.com/gorilla/mux"
	"github.com/octohelm/kubepkg/cmd/kubepkg/controller"
	"github.com/octohelm/kubepkg/internal/version"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type ServeOptions struct {
	AgentID            string
	SupportedPlatforms []string
	StorageRoot        string
	Addr               string
}

func NewAgent(c client.Client, opts ServeOptions) *Agent {
	return &Agent{opts: opts, c: c}
}

type Agent struct {
	opts ServeOptions
	c    client.Client
	r    *kubepkg.Registry
}

func (a *Agent) Serve(ctx context.Context) error {
	c := containerregistry.Configuration{
		StorageRoot: a.opts.StorageRoot,
	}

	cr, err := c.New(ctx)
	if err != nil {
		return err
	}

	a.r = kubepkg.NewRegistry(cr, c.MustStorage())

	l := logr.FromContextOrDiscard(ctx)

	router := mux.NewRouter()

	router.Path("/").HandlerFunc(a.liveness)

	router.Path("/kubepkgs").Methods(http.MethodHead).HandlerFunc(a.liveness)
	router.Path("/kubepkgs").Methods(http.MethodGet).HandlerFunc(a.list)
	router.Path("/kubepkgs").Methods(http.MethodPut).HandlerFunc(a.applyByTgz)
	router.Path("/kubepkgs/{name}").Methods(http.MethodDelete).HandlerFunc(a.del)

	router.Path("/blobs/{digest}").Methods(http.MethodHead).HandlerFunc(a.statBlob)
	router.Path("/blobs").Methods(http.MethodPut).HandlerFunc(a.uploadBlob)

	router.Use(a.loggerHandler(l))

	s := &http.Server{}
	s.Addr = a.opts.Addr
	s.Handler = router

	stopCh := make(chan os.Signal, 1)
	signal.Notify(stopCh, os.Interrupt, syscall.SIGTERM)

	go func() {
		l.Info(fmt.Sprintf(
			"kubepkg-agent serve on %s (%s/%s) [%s]",
			s.Addr,
			runtime.GOOS, runtime.GOARCH,
			ToKubeAgentHead(a.AgentInfo()),
		))

		if e := s.ListenAndServe(); e != nil {
			l.Error(e, "")
		}
	}()

	<-stopCh

	timeout := 10 * time.Second

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	return s.Shutdown(ctx)
}

func (a *Agent) loggerHandler(l logr.Logger) func(handler http.Handler) http.Handler {
	return func(handler http.Handler) http.Handler {
		return http.HandlerFunc(func(rws http.ResponseWriter, req *http.Request) {
			nextCtx := req.Context()
			nextCtx = logr.NewContext(nextCtx, l)

			started := time.Now()

			rw := &responseWriter{ResponseWriter: rws}

			rw.Header().Set(HEADER_KUBEPKG_AGENT, ToKubeAgentHead(a.AgentInfo()))

			handler.ServeHTTP(rw, req.WithContext(nextCtx))

			if req.Method != "HEAD" && req.URL.Path != "/" {
				values := []interface{}{
					"cost", time.Since(started),
					"status", rw.StatusCode,
				}

				if ct := req.Header.Get("Content-Type"); ct != "" {
					values = append(values, "req.content-type", ct)
				}

				l.Info(fmt.Sprintf("%s %s", req.Method, req.URL.String()), values...)
			}
		})
	}
}

func (a *Agent) liveness(rw http.ResponseWriter, req *http.Request) {
	rw.WriteHeader(http.StatusNoContent)
}

func (a *Agent) list(rw http.ResponseWriter, req *http.Request) {
	l := &v1alpha1.KubePkgList{}

	if err := a.c.List(req.Context(), l); err != nil {
		writeStatusErr(rw, http.StatusInternalServerError, err)
		return
	}

	if l.Items == nil {
		l.Items = []v1alpha1.KubePkg{}
	}

	rw.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(rw).Encode(l.Items)
}

func (a *Agent) statBlob(rw http.ResponseWriter, req *http.Request) {
	d, err := digest.Parse(mux.Vars(req)["digest"])
	if err != nil {
		writeStatusErr(rw, http.StatusBadRequest, err)
		return
	}

	ctx := req.Context()

	if _, err := a.r.Stat(ctx, d); err != nil {
		if err == distribution.ErrBlobUnknown {
			writeStatusErr(rw, http.StatusNotFound, err)
			return
		}
		writeStatusErr(rw, http.StatusInternalServerError, err)
		return
	}

	rw.WriteHeader(http.StatusNoContent)
}

func (a *Agent) uploadBlob(rw http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	defer req.Body.Close()

	dm, err := mime.FromContentType(req.Header.Get("Content-Type"))
	if err != nil {
		writeStatusErr(rw, http.StatusBadRequest, err)
		return
	}

	if err := a.r.ImportDigest(ctx, dm, req.Body); err != nil {
		writeStatusErr(rw, http.StatusBadRequest, err)
		return
	}

	rw.WriteHeader(http.StatusNoContent)
}

func (a *Agent) applyByTgz(rw http.ResponseWriter, req *http.Request) {
	ctx := req.Context()

	processBody := func() (*v1alpha1.KubePkg, error) {
		defer req.Body.Close()

		if strings.HasPrefix(req.Header.Get("Content-Type"), "application/json") {
			var kpkg v1alpha1.KubePkg
			if err := json.NewDecoder(req.Body).Decode(&kpkg); err != nil {
				return nil, err
			}
			return &kpkg, nil
		}

		return a.r.ImportFromKubeTgzReader(ctx, req.Body)
	}

	kpkg, err := processBody()
	if err != nil {
		writeStatusErr(rw, http.StatusBadRequest, err)
		return
	}

	if err := a.c.Patch(ctx, kpkg, client.Apply, controller.FieldOwner); err != nil {
		writeStatusErr(rw, http.StatusBadRequest, err)
		return
	}

	rw.Header().Set("Content-Type", "application/json; encoding=utf-8")
	rw.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(rw).Encode(kpkg)
}

func (a *Agent) del(rw http.ResponseWriter, req *http.Request) {
	ctx := req.Context()

	kpkg := &v1alpha1.KubePkg{}
	kpkg.SetGroupVersionKind(v1alpha1.SchemeGroupVersion.WithKind("KubePkg"))

	kpkg.Name = mux.Vars(req)["name"]
	kpkg.Namespace = req.URL.Query().Get("namespace")

	if kpkg.Namespace == "" {
		kpkg.Namespace = "default"
	}

	if err := a.c.Delete(ctx, kpkg); err != nil {
		writeStatusErr(rw, http.StatusBadRequest, err)
		return
	}

	rw.WriteHeader(http.StatusNoContent)
}

func (a *Agent) AgentInfo() *AgentInfo {
	return &AgentInfo{
		AgentID:            a.opts.AgentID,
		SupportedPlatforms: a.opts.SupportedPlatforms,
		Version:            version.Version,
	}
}
