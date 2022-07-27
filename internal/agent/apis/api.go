package apis

import (
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/agent/apis/blob"
	"github.com/octohelm/kubepkg/internal/agent/apis/kubepkg"
)

var R = courierhttp.GroupRouter("/api/kubepkg-agent").With(
	courierhttp.GroupRouter("/v1").With(
		kubepkg.R,
		blob.R,
	),
)
