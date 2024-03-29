/*
Package account GENERATED BY gengo:table 
DON'T EDIT THIS FILE
*/
package account

import (
	context "context"

	github_com_octohelm_storage_pkg_datatypes "github.com/octohelm/storage/pkg/datatypes"
	github_com_octohelm_storage_pkg_sqlbuilder "github.com/octohelm/storage/pkg/sqlbuilder"
)

func (AccessToken) TableName() string {
	return "t_account_access_token"
}

func (AccessToken) Primary() []string {
	return []string{
		"ID",
	}
}

func (AccessToken) Indexes() github_com_octohelm_storage_pkg_sqlbuilder.Indexes {
	return github_com_octohelm_storage_pkg_sqlbuilder.Indexes{
		"i_account": []string{
			"AccountID",
		},
		"i_created_at": []string{
			"CreatedAt",
		},
		"i_expires_at": []string{
			"ExpiresAt",
		},
	}
}

func init() {
	T.Add(AccessTokenT)
}

func (tableAccessToken) New() github_com_octohelm_storage_pkg_sqlbuilder.Model {
	return &AccessToken{}
}

func (t *tableAccessToken) IsNil() bool {
	return t.table.IsNil()
}

func (t *tableAccessToken) Ex(ctx context.Context) *github_com_octohelm_storage_pkg_sqlbuilder.Ex {
	return t.table.Ex(ctx)
}

func (t *tableAccessToken) TableName() string {
	return t.table.TableName()
}

func (t *tableAccessToken) F(name string) github_com_octohelm_storage_pkg_sqlbuilder.Column {
	return t.table.F(name)
}

func (t *tableAccessToken) K(name string) github_com_octohelm_storage_pkg_sqlbuilder.Key {
	return t.table.K(name)
}

func (t *tableAccessToken) Cols(names ...string) github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection {
	return t.table.Cols(names...)
}

func (t *tableAccessToken) Keys(names ...string) github_com_octohelm_storage_pkg_sqlbuilder.KeyCollection {
	return t.table.Keys(names...)
}

type tableAccessToken struct {
	I         indexNameOfAccessToken
	table     github_com_octohelm_storage_pkg_sqlbuilder.Table
	ID        github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[github_com_octohelm_storage_pkg_datatypes.SFID]
	AccountID github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[ID]
	Desc      github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[string]
	ExpiresAt github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[github_com_octohelm_storage_pkg_datatypes.Timestamp]
	CreatedAt github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[github_com_octohelm_storage_pkg_datatypes.Timestamp]
}

type indexNameOfAccessToken struct {
	Primary github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection
}

var AccessTokenT = &tableAccessToken{
	ID:        github_com_octohelm_storage_pkg_sqlbuilder.CastCol[github_com_octohelm_storage_pkg_datatypes.SFID](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&AccessToken{}).F("ID")),
	AccountID: github_com_octohelm_storage_pkg_sqlbuilder.CastCol[ID](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&AccessToken{}).F("AccountID")),
	Desc:      github_com_octohelm_storage_pkg_sqlbuilder.CastCol[string](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&AccessToken{}).F("Desc")),
	ExpiresAt: github_com_octohelm_storage_pkg_sqlbuilder.CastCol[github_com_octohelm_storage_pkg_datatypes.Timestamp](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&AccessToken{}).F("ExpiresAt")),
	CreatedAt: github_com_octohelm_storage_pkg_sqlbuilder.CastCol[github_com_octohelm_storage_pkg_datatypes.Timestamp](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&AccessToken{}).F("CreatedAt")),

	I: indexNameOfAccessToken{
		Primary: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&AccessToken{}).Cols([]string{
			"ID",
		}...),
	},
	table: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&AccessToken{}),
}

func (Account) TableName() string {
	return "t_account"
}

func (Account) Primary() []string {
	return []string{
		"ID",
	}
}

func (Account) UniqueIndexes() github_com_octohelm_storage_pkg_sqlbuilder.Indexes {
	return github_com_octohelm_storage_pkg_sqlbuilder.Indexes{
		"i_account": []string{
			"AccountID",
			"DeletedAt",
		},
	}
}

func (Account) Indexes() github_com_octohelm_storage_pkg_sqlbuilder.Indexes {
	return github_com_octohelm_storage_pkg_sqlbuilder.Indexes{
		"i_account_type": []string{
			"AccountType",
		},
		"i_created_at": []string{
			"CreatedAt",
		},
		"i_updated_at": []string{
			"UpdatedAt",
		},
	}
}

func init() {
	T.Add(AccountT)
}

func (tableAccount) New() github_com_octohelm_storage_pkg_sqlbuilder.Model {
	return &Account{}
}

func (t *tableAccount) IsNil() bool {
	return t.table.IsNil()
}

func (t *tableAccount) Ex(ctx context.Context) *github_com_octohelm_storage_pkg_sqlbuilder.Ex {
	return t.table.Ex(ctx)
}

func (t *tableAccount) TableName() string {
	return t.table.TableName()
}

func (t *tableAccount) F(name string) github_com_octohelm_storage_pkg_sqlbuilder.Column {
	return t.table.F(name)
}

func (t *tableAccount) K(name string) github_com_octohelm_storage_pkg_sqlbuilder.Key {
	return t.table.K(name)
}

func (t *tableAccount) Cols(names ...string) github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection {
	return t.table.Cols(names...)
}

func (t *tableAccount) Keys(names ...string) github_com_octohelm_storage_pkg_sqlbuilder.KeyCollection {
	return t.table.Keys(names...)
}

type tableAccount struct {
	I           indexNameOfAccount
	table       github_com_octohelm_storage_pkg_sqlbuilder.Table
	AccountID   github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[ID]
	AccountType github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[Type]
	ID          github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[uint64]
	CreatedAt   github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[github_com_octohelm_storage_pkg_datatypes.Timestamp]
	UpdatedAt   github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[github_com_octohelm_storage_pkg_datatypes.Timestamp]
	DeletedAt   github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[github_com_octohelm_storage_pkg_datatypes.Timestamp]
}

type indexNameOfAccount struct {
	Primary  github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection
	IAccount github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection
}

var AccountT = &tableAccount{
	AccountID:   github_com_octohelm_storage_pkg_sqlbuilder.CastCol[ID](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Account{}).F("AccountID")),
	AccountType: github_com_octohelm_storage_pkg_sqlbuilder.CastCol[Type](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Account{}).F("AccountType")),
	ID:          github_com_octohelm_storage_pkg_sqlbuilder.CastCol[uint64](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Account{}).F("ID")),
	CreatedAt:   github_com_octohelm_storage_pkg_sqlbuilder.CastCol[github_com_octohelm_storage_pkg_datatypes.Timestamp](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Account{}).F("CreatedAt")),
	UpdatedAt:   github_com_octohelm_storage_pkg_sqlbuilder.CastCol[github_com_octohelm_storage_pkg_datatypes.Timestamp](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Account{}).F("UpdatedAt")),
	DeletedAt:   github_com_octohelm_storage_pkg_sqlbuilder.CastCol[github_com_octohelm_storage_pkg_datatypes.Timestamp](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Account{}).F("DeletedAt")),

	I: indexNameOfAccount{
		Primary: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Account{}).Cols([]string{
			"ID",
		}...),
		IAccount: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Account{}).Cols([]string{
			"AccountID",
			"DeletedAt",
		}...),
	},
	table: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Account{}),
}

func (Identity) TableName() string {
	return "t_account_identity"
}

func (Identity) Primary() []string {
	return []string{
		"ID",
	}
}

func (Identity) UniqueIndexes() github_com_octohelm_storage_pkg_sqlbuilder.Indexes {
	return github_com_octohelm_storage_pkg_sqlbuilder.Indexes{
		"i_account_identity": []string{
			"IdentityType",
			"Identity",
		},
	}
}

func (Identity) Indexes() github_com_octohelm_storage_pkg_sqlbuilder.Indexes {
	return github_com_octohelm_storage_pkg_sqlbuilder.Indexes{
		"i_account": []string{
			"AccountID",
		},
		"i_created_at": []string{
			"CreatedAt",
		},
		"i_updated_at": []string{
			"UpdatedAt",
		},
	}
}

func init() {
	T.Add(IdentityT)
}

func (tableIdentity) New() github_com_octohelm_storage_pkg_sqlbuilder.Model {
	return &Identity{}
}

func (t *tableIdentity) IsNil() bool {
	return t.table.IsNil()
}

func (t *tableIdentity) Ex(ctx context.Context) *github_com_octohelm_storage_pkg_sqlbuilder.Ex {
	return t.table.Ex(ctx)
}

func (t *tableIdentity) TableName() string {
	return t.table.TableName()
}

func (t *tableIdentity) F(name string) github_com_octohelm_storage_pkg_sqlbuilder.Column {
	return t.table.F(name)
}

func (t *tableIdentity) K(name string) github_com_octohelm_storage_pkg_sqlbuilder.Key {
	return t.table.K(name)
}

func (t *tableIdentity) Cols(names ...string) github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection {
	return t.table.Cols(names...)
}

func (t *tableIdentity) Keys(names ...string) github_com_octohelm_storage_pkg_sqlbuilder.KeyCollection {
	return t.table.Keys(names...)
}

type tableIdentity struct {
	I            indexNameOfIdentity
	table        github_com_octohelm_storage_pkg_sqlbuilder.Table
	AccountID    github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[ID]
	IdentityType github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[IdentityType]
	Identity     github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[string]
	ID           github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[uint64]
	CreatedAt    github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[github_com_octohelm_storage_pkg_datatypes.Timestamp]
	UpdatedAt    github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[github_com_octohelm_storage_pkg_datatypes.Timestamp]
}

type indexNameOfIdentity struct {
	Primary          github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection
	IAccountIdentity github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection
}

var IdentityT = &tableIdentity{
	AccountID:    github_com_octohelm_storage_pkg_sqlbuilder.CastCol[ID](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Identity{}).F("AccountID")),
	IdentityType: github_com_octohelm_storage_pkg_sqlbuilder.CastCol[IdentityType](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Identity{}).F("IdentityType")),
	Identity:     github_com_octohelm_storage_pkg_sqlbuilder.CastCol[string](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Identity{}).F("Identity")),
	ID:           github_com_octohelm_storage_pkg_sqlbuilder.CastCol[uint64](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Identity{}).F("ID")),
	CreatedAt:    github_com_octohelm_storage_pkg_sqlbuilder.CastCol[github_com_octohelm_storage_pkg_datatypes.Timestamp](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Identity{}).F("CreatedAt")),
	UpdatedAt:    github_com_octohelm_storage_pkg_sqlbuilder.CastCol[github_com_octohelm_storage_pkg_datatypes.Timestamp](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Identity{}).F("UpdatedAt")),

	I: indexNameOfIdentity{
		Primary: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Identity{}).Cols([]string{
			"ID",
		}...),
		IAccountIdentity: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Identity{}).Cols([]string{
			"IdentityType",
			"Identity",
		}...),
	},
	table: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Identity{}),
}

func (VendorIdentity) TableName() string {
	return "t_account_vendor_identity"
}

func (VendorIdentity) Primary() []string {
	return []string{
		"ID",
	}
}

func (VendorIdentity) UniqueIndexes() github_com_octohelm_storage_pkg_sqlbuilder.Indexes {
	return github_com_octohelm_storage_pkg_sqlbuilder.Indexes{
		"i_vendor_identity": []string{
			"VendorIdentityFrom",
			"VendorIdentity",
		},
	}
}

func (VendorIdentity) Indexes() github_com_octohelm_storage_pkg_sqlbuilder.Indexes {
	return github_com_octohelm_storage_pkg_sqlbuilder.Indexes{
		"i_account_id": []string{
			"AccountID",
		},
		"i_created_at": []string{
			"CreatedAt",
		},
		"i_updated_at": []string{
			"UpdatedAt",
		},
	}
}

func init() {
	T.Add(VendorIdentityT)
}

func (tableVendorIdentity) New() github_com_octohelm_storage_pkg_sqlbuilder.Model {
	return &VendorIdentity{}
}

func (t *tableVendorIdentity) IsNil() bool {
	return t.table.IsNil()
}

func (t *tableVendorIdentity) Ex(ctx context.Context) *github_com_octohelm_storage_pkg_sqlbuilder.Ex {
	return t.table.Ex(ctx)
}

func (t *tableVendorIdentity) TableName() string {
	return t.table.TableName()
}

func (t *tableVendorIdentity) F(name string) github_com_octohelm_storage_pkg_sqlbuilder.Column {
	return t.table.F(name)
}

func (t *tableVendorIdentity) K(name string) github_com_octohelm_storage_pkg_sqlbuilder.Key {
	return t.table.K(name)
}

func (t *tableVendorIdentity) Cols(names ...string) github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection {
	return t.table.Cols(names...)
}

func (t *tableVendorIdentity) Keys(names ...string) github_com_octohelm_storage_pkg_sqlbuilder.KeyCollection {
	return t.table.Keys(names...)
}

type tableVendorIdentity struct {
	I                  indexNameOfVendorIdentity
	table              github_com_octohelm_storage_pkg_sqlbuilder.Table
	AccountID          github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[ID]
	VendorIdentityFrom github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[string]
	VendorIdentity     github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[string]
	ID                 github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[uint64]
	CreatedAt          github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[github_com_octohelm_storage_pkg_datatypes.Timestamp]
	UpdatedAt          github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[github_com_octohelm_storage_pkg_datatypes.Timestamp]
}

type indexNameOfVendorIdentity struct {
	Primary         github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection
	IVendorIdentity github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection
}

var VendorIdentityT = &tableVendorIdentity{
	AccountID:          github_com_octohelm_storage_pkg_sqlbuilder.CastCol[ID](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&VendorIdentity{}).F("AccountID")),
	VendorIdentityFrom: github_com_octohelm_storage_pkg_sqlbuilder.CastCol[string](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&VendorIdentity{}).F("VendorIdentityFrom")),
	VendorIdentity:     github_com_octohelm_storage_pkg_sqlbuilder.CastCol[string](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&VendorIdentity{}).F("VendorIdentity")),
	ID:                 github_com_octohelm_storage_pkg_sqlbuilder.CastCol[uint64](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&VendorIdentity{}).F("ID")),
	CreatedAt:          github_com_octohelm_storage_pkg_sqlbuilder.CastCol[github_com_octohelm_storage_pkg_datatypes.Timestamp](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&VendorIdentity{}).F("CreatedAt")),
	UpdatedAt:          github_com_octohelm_storage_pkg_sqlbuilder.CastCol[github_com_octohelm_storage_pkg_datatypes.Timestamp](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&VendorIdentity{}).F("UpdatedAt")),

	I: indexNameOfVendorIdentity{
		Primary: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&VendorIdentity{}).Cols([]string{
			"ID",
		}...),
		IVendorIdentity: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&VendorIdentity{}).Cols([]string{
			"VendorIdentityFrom",
			"VendorIdentity",
		}...),
	},
	table: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&VendorIdentity{}),
}
