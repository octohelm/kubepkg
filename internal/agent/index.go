package agent

import (
	"embed"
	"fmt"
	"io/fs"
	"net/http"
	"strings"
	"time"
)

//go:embed dist
var content embed.FS

var root, _ = fs.Sub(content, "dist")

var webUI = http.FileServer(http.FS(root))

var WebUI = http.HandlerFunc(func(rw http.ResponseWriter, request *http.Request) {
	if strings.HasPrefix(request.URL.Path, "/assets/") {
		expires(rw.Header(), 30*24*time.Hour)
	}
	webUI.ServeHTTP(rw, request)
})

func expires(header http.Header, d time.Duration) {
	header.Set("Cache-Control", fmt.Sprintf("max-age=%d", d/time.Second))
}
