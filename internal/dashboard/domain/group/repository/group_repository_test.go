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

func TestGroupRepository(t *testing.T) {
	var d = &struct {
		otel.Otel
		idgen.IDGen
		dashboard.Database
	}{}
	d.LogLevel = "debug"
	d.EnableMigrate = true

	ctx := testingutil.NewContext(t, d)

	repo := repository.NewGroupRepository()

	t.Run("When add a group test", func(t *testing.T) {
		created, err := repo.Put(ctx, "test", group.Info{
			Desc: "test",
		})
		testingutil.Expect(t, err, testingutil.Be[error](nil))
		testingutil.Expect(t, created.ID > 0, testingutil.Be(true))

		t.Run("Should update desc", func(t *testing.T) {
			updated, err := repo.Put(ctx, "test", group.Info{
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

		t.Run("Should list by name prefix", func(t *testing.T) {
			listed, err := repo.List(ctx, group.GroupT.Name.V(sqlbuilder.RightLike("te")))
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, len(listed) > 0, testingutil.Be(true))
		})

		t.Run("Should delete by name", func(t *testing.T) {
			err := repo.Delete(ctx, "test")
			testingutil.Expect(t, err, testingutil.Be[error](nil))
		})
	})
}
