package manifest_test

import (
	"fmt"
	"path/filepath"
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
			for n, m := range manifests {
				fmt.Println(n, m.GetLabels())
			}
		})
	})
}
