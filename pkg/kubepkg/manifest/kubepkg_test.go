package manifest

import (
	"path/filepath"
	"testing"

	"github.com/davecgh/go-spew/spew"
	"github.com/octohelm/kubepkg/pkg/kubepkg"

	. "github.com/octohelm/kubepkg/internal/testingutil"
)

var projectRoot = ProjectRoot()

func TestExtractComplete(t *testing.T) {
	t.Run("When extract kubepkg.spec", func(t *testing.T) {
		kpkg, _ := kubepkg.Load(filepath.Join(projectRoot, "testdata/demo.yaml"))

		t.Run("Should be successfully", func(t *testing.T) {
			manifests, err := ExtractComplete(kpkg)
			Expect(t, err, Be[error](nil))
			spew.Dump(manifests)
		})
	})
}
