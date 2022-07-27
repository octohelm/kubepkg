package repository_test

import (
	"testing"

	"github.com/octohelm/storage/pkg/sqlbuilder"

	"github.com/innoai-tech/infra/pkg/otel"
	"github.com/octohelm/kubepkg/internal/dashboard"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/cluster"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/repository"
	"github.com/octohelm/kubepkg/internal/testingutil"
	"github.com/octohelm/kubepkg/pkg/idgen"
)

var d = &struct {
	otel.Otel
	idgen.IDGen
	dashboard.Database
}{}

func init() {
	d.LogLevel = "debug"
	d.EnableMigrate = true
}

func TestClusterRepository(t *testing.T) {
	ctx := testingutil.NewContext(t, d)

	repo := repository.NewClusterRepository()

	t.Run("When add a cluster test", func(t *testing.T) {
		created, err := repo.Put(ctx, "test", cluster.Info{
			Desc: "test",
		})
		testingutil.Expect(t, err, testingutil.Be[error](nil))
		testingutil.Expect(t, created.ID > 0, testingutil.Be(true))

		t.Run("Should update desc", func(t *testing.T) {
			updated, err := repo.Put(ctx, "test", cluster.Info{
				Desc: "test 2",
			})
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, updated.Desc, testingutil.NotBe(created.Desc))
		})

		t.Run("Should get by name", func(t *testing.T) {
			found, err := repo.Get(ctx, "test")
			testingutil.Expect(t, err, testingutil.Be[error](nil))

			testingutil.Expect(t, found.ID, testingutil.Be(created.ID))
		})

		t.Run("should rename", func(t *testing.T) {
			renamed, err := repo.Rename(ctx, created.Name, "test-2")
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, renamed.ID, testingutil.Be(created.ID))
		})

		t.Run("Should list by name prefix", func(t *testing.T) {
			listed, err := repo.List(ctx, cluster.ClusterT.Name.V(sqlbuilder.RightLike("test")))
			testingutil.Expect(t, err, testingutil.Be[error](nil))

			testingutil.Expect(t, len(listed) > 0, testingutil.Be(true))
		})

		t.Run("Should delete by name", func(t *testing.T) {
			err := repo.Delete(ctx, "test-2")
			testingutil.Expect(t, err, testingutil.Be[error](nil))
		})
	})
}
