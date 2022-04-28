package manifest

import (
	"github.com/davecgh/go-spew/spew"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	. "github.com/octohelm/kubepkg/pkg/testutil"
	"path/filepath"
	"testing"
)

var projectRoot = ProjectRoot()

func TestExtractComplete(t *testing.T) {
	t.Run("When extract kubepkg.spec", WithT(func() {
		kpkg, _ := kubepkg.Load(filepath.Join(projectRoot, "testdata/demo.yaml"))

		It("Should be successfully", func() {
			manifests, err := ExtractComplete(kpkg)
			So(err, ShouldBeNil)

			spew.Dump(manifests)
		})
	}))
}
