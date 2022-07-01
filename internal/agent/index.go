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
var base = "/agent/"

var webUI = http.FileServer(http.FS(root))

var WebUI = http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
	if strings.HasPrefix(req.URL.Path+"/", base) {
		req.URL.Path = strings.TrimPrefix(req.URL.Path, base[0:len(base)-1])
	}

	req.RequestURI = req.URL.String()

	if strings.HasPrefix(req.RequestURI, "/assets/") {
		expires(rw.Header(), 30*24*time.Hour)
	}

	webUI.ServeHTTP(rw, req)
})

func expires(header http.Header, d time.Duration) {
	header.Set("Cache-Control", fmt.Sprintf("max-age=%d", d/time.Second))
}
