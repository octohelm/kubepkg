package repository_test

import (
	"testing"

	"github.com/innoai-tech/infra/pkg/otel"
	"github.com/octohelm/kubepkg/internal/dashboard"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"
	accountrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/account/repository"
	"github.com/octohelm/kubepkg/internal/testingutil"
	"github.com/octohelm/kubepkg/pkg/idgen"
)

func TestAccountRepository(t *testing.T) {
	d := &struct {
		otel.Otel
		idgen.IDGen
		dashboard.Database
	}{}
	d.LogLevel = "debug"
	d.EnableMigrate = true

	ctx := testingutil.NewContext(t, d)

	repo := accountrepository.NewAccountRepository()

	t.Run("could add robot", func(t *testing.T) {
		_, err := repo.Add(ctx, account.TYPE__ROBOT)
		testingutil.Expect(t, err, testingutil.Be[error](nil))
	})

	t.Run("could add user", func(t *testing.T) {
		userInfo := account.UserInfo{
			Email:    "x@x.io",
			Mobile:   "17211110000",
			Nickname: "x",
		}

		created, err := repo.PutUser(ctx, userInfo, 0)
		testingutil.Expect(t, err, testingutil.Be[error](nil))

		t.Run("when recreate", func(t *testing.T) {
			created2, err := repo.PutUser(ctx, userInfo, 0)
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, created2, testingutil.Equal(created))
		})

		t.Run("when recreate and update info", func(t *testing.T) {
			userInfo2 := userInfo
			userInfo2.Mobile = "17200001111"

			created2, err := repo.PutUser(ctx, userInfo2, 0)
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, created2.AccountID, testingutil.Equal(created.AccountID))
			testingutil.Expect(t, created2.Mobile, testingutil.Equal(userInfo2.Mobile))
		})
	})

	t.Run("list user", func(t *testing.T) {
		accountList, err := repo.ListUserAccount(ctx, account.UserQueryParams{
			Identity: []string{"1720000"},
		})
		testingutil.Expect(t, err, testingutil.Be[error](nil))
		testingutil.Expect(t, len(accountList.Data), testingutil.Be(1))
		testingutil.Expect(t, accountList.Data[0].Mobile, testingutil.Be("17200001111"))
	})

	t.Run("list all user", func(t *testing.T) {
		accountList, err := repo.ListUserAccount(ctx, account.UserQueryParams{})
		testingutil.Expect(t, err, testingutil.Be[error](nil))
		testingutil.Expect(t, len(accountList.Data), testingutil.Be(1))
		testingutil.Expect(t, accountList.Total, testingutil.Be(1))
	})
}
