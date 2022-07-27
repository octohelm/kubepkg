package repository_test

import (
	"testing"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"

	"github.com/innoai-tech/infra/pkg/otel"
	"github.com/octohelm/kubepkg/internal/dashboard"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	"github.com/octohelm/kubepkg/internal/testingutil"
	"github.com/octohelm/kubepkg/pkg/idgen"
)

func TestGroupAccountRepository(t *testing.T) {
	var d = &struct {
		otel.Otel
		idgen.IDGen
		dashboard.Database
	}{}
	d.LogLevel = "debug"
	d.EnableMigrate = true

	ctx := testingutil.NewContext(t, d)

	repo := repository.NewGroupAccountRepository(&group.Group{
		ID:   1,
		Name: "test",
	})

	t.Run("When put group", func(t *testing.T) {
		created, err := repo.Put(ctx, group.ROLE_TYPE__MEMBER, 1)
		testingutil.Expect(t, err, testingutil.Be[error](nil))
		testingutil.Expect(t, created.AccountID, testingutil.Be(account.ID(1)))

		t.Run("Should delete by name", func(t *testing.T) {
			err := repo.Delete(ctx, 1)
			testingutil.Expect(t, err, testingutil.Be[error](nil))
		})

	})
}
