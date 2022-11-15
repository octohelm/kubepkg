package v1alpha1

import (
	"testing"

	"github.com/octohelm/kubepkg/internal/testingutil"
)

func TestHostPath(t *testing.T) {
	v := HostPath{
		Host: "internal",
		Path: "/",
	}

	data, _ := v.MarshalText()

	v2 := HostPath{}
	_ = v2.UnmarshalText(data)

	testingutil.Expect(t, v2, testingutil.Equal(v))
}
