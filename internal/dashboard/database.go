package dashboard

import (
	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"
	accountrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/account/repository"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/cluster"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg"
	"github.com/octohelm/kubepkg/pkg/auth"
	"github.com/octohelm/storage/pkg/dal"
)

type Database struct {
	dal.Database
}

func (s *Database) SetDefaults() {
	s.Database.ApplyCatalog(
		"kubepkg-dashboard",
		account.T,
		group.T,
		cluster.T,
		kubepkg.T,
		// added more domain
	)
	s.Database.SetDefaults()
}

type AuthProvider struct {
	auth.Provider
}

func (a *AuthProvider) SetDefaults() {
	a.SetAccountExchanger(accountrepository.NewAccountExchanger())
	a.Provider.SetDefaults()
}
