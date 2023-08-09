package semver

import (
	"testing"

	testingx "github.com/octohelm/x/testing"
)

func TestParse(t *testing.T) {
	t.Run("could parse exact version", func(t *testing.T) {
		sv := Parse("v3.1.2-20230822080114-147d45f4785d")
		testingx.Expect(t, sv.Major, testingx.Be(3))
		testingx.Expect(t, sv.Minor, testingx.Be(1))
		testingx.Expect(t, sv.Patch, testingx.Be(2))
	})

	t.Run("could parse pseudo version", func(t *testing.T) {
		sv := Parse("v3.1.1-0.20230822080114-147d45f4785d")
		testingx.Expect(t, sv.Major, testingx.Be(3))
		testingx.Expect(t, sv.Minor, testingx.Be(1))
		testingx.Expect(t, sv.Patch, testingx.Be(0))
	})
}
