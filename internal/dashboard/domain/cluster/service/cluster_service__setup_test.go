package service

import (
	"testing"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/cluster"
	"github.com/octohelm/kubepkg/internal/testingutil"
	"github.com/octohelm/kubepkg/pkg/idgen"
	"github.com/octohelm/kubepkg/pkg/signer"
)

func TestClusterService(t *testing.T) {
	v := &struct {
		idgen.IDGen
		signer.JWTSigner
	}{}

	ctx := testingutil.NewContext(t, v)

	c := &cluster.Cluster{
		Name: "test",
	}

	//c.Info.Metadata

	cs := NewClusterService(c)

	t.Run("CreateResources", func(t *testing.T) {
		resources, err := cs.CreateResources(ctx)
		testingutil.Expect(t, err, testingutil.Be[error](nil))
		testingutil.PrintJSON(resources)
	})
}
