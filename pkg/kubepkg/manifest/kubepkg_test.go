package manifest_test

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"sort"
	"testing"

	. "github.com/octohelm/kubepkg/internal/testingutil"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	"github.com/octohelm/kubepkg/pkg/kubepkg/manifest"
)

var projectRoot = ProjectRoot()

func TestExtractComplete(t *testing.T) {
	t.Run("When extract kubepkg.spec", func(t *testing.T) {
		kpkgs, err := kubepkg.Load(filepath.Join(projectRoot, "testdata/demo.yaml"))
		Expect(t, err, Be[error](nil))

		t.Run("Should be successfully", func(t *testing.T) {
			manifests, err := manifest.ExtractComplete(kpkgs[0])
			Expect(t, err, Be[error](nil))

			names := make([]string, 0)

			for n, m := range manifests {
				names = append(names, n)
				if n == "deployment.demo" {
					data, err := json.MarshalIndent(m, "", " ")
					if err == nil {
						fmt.Println(string(data))
					}
				}
			}
			sort.Strings(names)
			Expect(t, names, Equal([]string{
				"configmap.demo",
				"configmap.demo-html",
				"configmap.endpoint-demo",
				"deployment.demo",
				"ingress.demo",
				"service.demo",
			}))
		})
	})
}
