package repository_test

import (
	"testing"

	"github.com/octohelm/storage/pkg/sqlbuilder"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"

	"github.com/innoai-tech/infra/pkg/otel"
	"github.com/octohelm/kubepkg/internal/dashboard"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	"github.com/octohelm/kubepkg/internal/testingutil"
	"github.com/octohelm/kubepkg/pkg/idgen"
)

func TestGroupEnvRepository(t *testing.T) {
	var d = &struct {
		otel.Otel
		idgen.IDGen
		dashboard.Database
	}{}
	d.LogLevel = "debug"
	d.EnableMigrate = true

	ctx := testingutil.NewContext(t, d)

	repo := repository.NewGroupEnvRepository(&group.Group{
		ID:   1,
		Name: "test",
	})

	t.Run("When put env", func(t *testing.T) {
		created, err := repo.Put(ctx, "test", group.EnvInfo{
			EnvType: group.ENV_TYPE__DEV,
			Desc:    "test",
		})
		testingutil.Expect(t, err, testingutil.Be[error](nil))
		testingutil.Expect(t, created.EnvID > 0, testingutil.Be(true))

		created, err = repo.BindCluster(ctx, "test", 1)
		testingutil.Expect(t, err, testingutil.Be[error](nil))
		testingutil.Expect(t, created.EnvID > 0, testingutil.Be(true))

		t.Run("Should get by name", func(t *testing.T) {
			found, err := repo.Get(ctx, "test")
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, found.EnvID, testingutil.Be(created.EnvID))
			testingutil.Expect(t, found.ClusterID, testingutil.Be(created.ClusterID))
		})

		t.Run("Should list by name prefix", func(t *testing.T) {
			listed, err := repo.List(ctx, group.EnvT.EnvName.V(sqlbuilder.RightLike("tes")))
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, len(listed) > 0, testingutil.Be(true))
		})

		t.Run("Should delete by name", func(t *testing.T) {
			err := repo.Delete(ctx, "test")
			testingutil.Expect(t, err, testingutil.Be[error](nil))
		})
	})
}
