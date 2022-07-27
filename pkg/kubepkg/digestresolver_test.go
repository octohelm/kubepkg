package kubepkg

import (
	"testing"

	testingx "github.com/octohelm/x/testing"
	"github.com/opencontainers/go-digest"
)

func Test_parseImageCtx(t *testing.T) {
	t.Run("full parse", func(t *testing.T) {
		ic, _ := parseImageCtx("ghcr.io/octohelm/kubepkg:dev@sha256:79e730196d955d16536e10a1f4ef5aed1662f9505222368d4c4f15e0bc82b6b9")
		testingx.Expect(t, ic.name, testingx.Be("ghcr.io/octohelm/kubepkg"))
		testingx.Expect(t, ic.tag, testingx.Be("dev"))
		testingx.Expect(t, ic.digest.String(), testingx.Be("sha256:79e730196d955d16536e10a1f4ef5aed1662f9505222368d4c4f15e0bc82b6b9"))
	})

	t.Run("parse without digest", func(t *testing.T) {
		ic, _ := parseImageCtx("ghcr.io/octohelm/kubepkg:dev")
		testingx.Expect(t, ic.name, testingx.Be("ghcr.io/octohelm/kubepkg"))
		testingx.Expect(t, ic.tag, testingx.Be("dev"))
		testingx.Expect(t, ic.digest, testingx.Be[*digest.Digest](nil))
	})
}
