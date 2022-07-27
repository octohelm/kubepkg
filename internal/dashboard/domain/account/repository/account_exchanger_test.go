package repository_test

import (
	"testing"

	accountrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/account/repository"

	"github.com/innoai-tech/infra/pkg/otel"
	"github.com/octohelm/kubepkg/internal/dashboard"
	"github.com/octohelm/kubepkg/internal/testingutil"
	"github.com/octohelm/kubepkg/pkg/idgen"
)

func TestExchanger(t *testing.T) {
	d := &struct {
		otel.Otel
		idgen.IDGen
		dashboard.Database
	}{}
	d.LogLevel = "debug"
	d.EnableMigrate = true

	ctx := testingutil.NewContext(t, d)
	a := accountrepository.AccountExchanger{}

	t.Run("Exchange", func(t *testing.T) {
		accountIDs, err := a.Exchange(ctx, "oidc", &MockUserInfo{}, true)
		testingutil.Expect(t, err, testingutil.Be[error](nil))

		t.Run("Re exchange", func(t *testing.T) {
			accountIDs2, err := a.Exchange(ctx, "oidc", &MockUserInfo{}, true)
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, accountIDs2, testingutil.Equal(accountIDs))
		})
	})
}

type MockUserInfo struct {
}

func (i MockUserInfo) Mobile() string {
	return "1"
}

func (i MockUserInfo) Nickname() string {
	return "1"
}

func (MockUserInfo) ID() string {
	return "test"
}

func (MockUserInfo) Email() string {
	return "test@octohelm.tech"
}

func (MockUserInfo) Claims(v interface{}) error {
	return nil
}
