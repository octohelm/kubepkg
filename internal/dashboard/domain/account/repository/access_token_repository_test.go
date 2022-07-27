package repository_test

import (
	"testing"
	"time"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"

	accountrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/account/repository"

	"github.com/innoai-tech/infra/pkg/otel"
	"github.com/octohelm/kubepkg/internal/dashboard"
	"github.com/octohelm/kubepkg/internal/testingutil"
	"github.com/octohelm/kubepkg/pkg/idgen"
)

func TestAccessTokenRepository(t *testing.T) {
	d := &struct {
		otel.Otel
		idgen.IDGen
		dashboard.Database
	}{}
	d.LogLevel = "debug"
	d.EnableMigrate = true

	ctx := testingutil.NewContext(t, d)

	repo := accountrepository.NewAccessTokenRepository(&account.Account{
		AccountID: 1,
	})

	t.Run("When record", func(t *testing.T) {
		err := repo.Record(ctx, 1, "test", time.Now().Add(time.Hour))
		testingutil.Expect(t, err, testingutil.Be[error](nil))

		t.Run("Should be listed", func(t *testing.T) {
			list, err := repo.List(ctx, nil)
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, len(list) > 0, testingutil.Be(true))
		})
	})
}
