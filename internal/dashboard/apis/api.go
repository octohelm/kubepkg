package apis

import (
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/admin"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/auth"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/cluster"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/group"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/kubepkg"
	"github.com/octohelm/kubepkg/internal/dashboard/apis/user"
)

var R = courierhttp.GroupRouter("/api/kubepkg-dashboard").With(
	courierhttp.GroupRouter("/v0").With(
		auth.R,
		user.R,
		cluster.R,
		group.R,
		admin.R,
		kubepkg.R,
	),
)
