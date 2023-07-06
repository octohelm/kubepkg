package apis

import (
	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/courier/pkg/courierhttp/handler/httprouter"
	"github.com/octohelm/kubepkg/internal/agent/apis/auth"
	"github.com/octohelm/kubepkg/internal/agent/apis/cluster"
	"github.com/octohelm/kubepkg/internal/agent/apis/kubepkg"
	"github.com/octohelm/kubepkg/internal/agent/apis/registry"
)

var R = courierhttp.GroupRouter("/").With(
	registry.R,
	courierhttp.GroupRouter("/api/kubepkg-agent").With(
		courier.NewRouter(&httprouter.OpenAPI{}),
		courierhttp.GroupRouter("/v1").With(
			auth.R,
			kubepkg.R,
			cluster.R,
		),
	),
)
