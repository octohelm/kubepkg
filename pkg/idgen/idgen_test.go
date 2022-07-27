package idgen

import (
	"testing"

	. "github.com/octohelm/x/testing"
)

func TestIDGen(t *testing.T) {
	idgen, _ := New()

	ids := map[uint64]bool{}

	for i := 0; i < 1000; i++ {
		id, _ := idgen.ID()
		ids[id] = true
	}
	Expect(t, len(ids), Be(1000))
}
