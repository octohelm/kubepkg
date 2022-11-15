package dashboard

import (
	"embed"
	"io/fs"

	"github.com/innoai-tech/infra/pkg/http/webapp"
	"github.com/octohelm/kubepkg/pkg/version"
)

//go:embed dist
var content embed.FS

var root, _ = fs.Sub(content, "dist")

var WebUI = webapp.ServeFS(root, webapp.WithBaseHref("/"), webapp.WithAppVersion(version.Version()))
