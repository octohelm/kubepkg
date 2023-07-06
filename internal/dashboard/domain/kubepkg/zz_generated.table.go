/*
Package kubepkg GENERATED BY gengo:table 
DON'T EDIT THIS FILE
*/
package kubepkg

import (
	context "context"

	github_com_octohelm_storage_pkg_datatypes "github.com/octohelm/storage/pkg/datatypes"
	github_com_octohelm_storage_pkg_sqlbuilder "github.com/octohelm/storage/pkg/sqlbuilder"
)

func (Kubepkg) TableName() string {
	return "t_kubepkg"
}

func (Kubepkg) Primary() []string {
	return []string{
		"ID",
		"DeletedAt",
	}
}

func (Kubepkg) UniqueIndexes() github_com_octohelm_storage_pkg_sqlbuilder.Indexes {
	return github_com_octohelm_storage_pkg_sqlbuilder.Indexes{
		"i_name": []string{
			"Group",
			"Name",
		},
	}
}

func (Kubepkg) Indexes() github_com_octohelm_storage_pkg_sqlbuilder.Indexes {
	return github_com_octohelm_storage_pkg_sqlbuilder.Indexes{
		"i_created_at": []string{
			"CreatedAt",
		},
		"i_updated_at": []string{
			"UpdatedAt",
		},
	}
}

func init() {
	T.Add(KubepkgT)
}

func (tableKubepkg) New() github_com_octohelm_storage_pkg_sqlbuilder.Model {
	return &Kubepkg{}
}

func (t *tableKubepkg) IsNil() bool {
	return t.table.IsNil()
}

func (t *tableKubepkg) Ex(ctx context.Context) *github_com_octohelm_storage_pkg_sqlbuilder.Ex {
	return t.table.Ex(ctx)
}

func (t *tableKubepkg) TableName() string {
	return t.table.TableName()
}

func (t *tableKubepkg) F(name string) github_com_octohelm_storage_pkg_sqlbuilder.Column {
	return t.table.F(name)
}

func (t *tableKubepkg) K(name string) github_com_octohelm_storage_pkg_sqlbuilder.Key {
	return t.table.K(name)
}

func (t *tableKubepkg) Cols(names ...string) github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection {
	return t.table.Cols(names...)
}

func (t *tableKubepkg) Keys(names ...string) github_com_octohelm_storage_pkg_sqlbuilder.KeyCollection {
	return t.table.Keys(names...)
}

type tableKubepkg struct {
	I         indexNameOfKubepkg
	table     github_com_octohelm_storage_pkg_sqlbuilder.Table
	ID        github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[ID]
	Group     github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[string]
	Name      github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[string]
	CreatedAt github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[github_com_octohelm_storage_pkg_datatypes.Timestamp]
	UpdatedAt github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[github_com_octohelm_storage_pkg_datatypes.Timestamp]
	DeletedAt github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[github_com_octohelm_storage_pkg_datatypes.Timestamp]
}

type indexNameOfKubepkg struct {
	Primary github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection
	IName   github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection
}

var KubepkgT = &tableKubepkg{
	ID:        github_com_octohelm_storage_pkg_sqlbuilder.CastCol[ID](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Kubepkg{}).F("ID")),
	Group:     github_com_octohelm_storage_pkg_sqlbuilder.CastCol[string](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Kubepkg{}).F("Group")),
	Name:      github_com_octohelm_storage_pkg_sqlbuilder.CastCol[string](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Kubepkg{}).F("Name")),
	CreatedAt: github_com_octohelm_storage_pkg_sqlbuilder.CastCol[github_com_octohelm_storage_pkg_datatypes.Timestamp](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Kubepkg{}).F("CreatedAt")),
	UpdatedAt: github_com_octohelm_storage_pkg_sqlbuilder.CastCol[github_com_octohelm_storage_pkg_datatypes.Timestamp](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Kubepkg{}).F("UpdatedAt")),
	DeletedAt: github_com_octohelm_storage_pkg_sqlbuilder.CastCol[github_com_octohelm_storage_pkg_datatypes.Timestamp](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Kubepkg{}).F("DeletedAt")),

	I: indexNameOfKubepkg{
		Primary: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Kubepkg{}).Cols([]string{
			"ID",
			"DeletedAt",
		}...),
		IName: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Kubepkg{}).Cols([]string{
			"Group",
			"Name",
		}...),
	},
	table: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Kubepkg{}),
}

func (Revision) TableName() string {
	return "t_kubepkg_revision"
}

func (Revision) Primary() []string {
	return []string{
		"ID",
	}
}

func (Revision) UniqueIndexes() github_com_octohelm_storage_pkg_sqlbuilder.Indexes {
	return github_com_octohelm_storage_pkg_sqlbuilder.Indexes{
		"i_digest": []string{
			"KubepkgID",
			"Digest",
		},
	}
}

func (Revision) Indexes() github_com_octohelm_storage_pkg_sqlbuilder.Indexes {
	return github_com_octohelm_storage_pkg_sqlbuilder.Indexes{
		"i_created_at": []string{
			"CreatedAt",
		},
	}
}

func init() {
	T.Add(RevisionT)
}

func (tableRevision) New() github_com_octohelm_storage_pkg_sqlbuilder.Model {
	return &Revision{}
}

func (t *tableRevision) IsNil() bool {
	return t.table.IsNil()
}

func (t *tableRevision) Ex(ctx context.Context) *github_com_octohelm_storage_pkg_sqlbuilder.Ex {
	return t.table.Ex(ctx)
}

func (t *tableRevision) TableName() string {
	return t.table.TableName()
}

func (t *tableRevision) F(name string) github_com_octohelm_storage_pkg_sqlbuilder.Column {
	return t.table.F(name)
}

func (t *tableRevision) K(name string) github_com_octohelm_storage_pkg_sqlbuilder.Key {
	return t.table.K(name)
}

func (t *tableRevision) Cols(names ...string) github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection {
	return t.table.Cols(names...)
}

func (t *tableRevision) Keys(names ...string) github_com_octohelm_storage_pkg_sqlbuilder.KeyCollection {
	return t.table.Keys(names...)
}

type tableRevision struct {
	I         indexNameOfRevision
	table     github_com_octohelm_storage_pkg_sqlbuilder.Table
	ID        github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[RevisionID]
	KubepkgID github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[ID]
	Digest    github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[string]
	Spec      github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[[]uint8]
	CreatedAt github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[github_com_octohelm_storage_pkg_datatypes.Timestamp]
}

type indexNameOfRevision struct {
	Primary github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection
	IDigest github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection
}

var RevisionT = &tableRevision{
	ID:        github_com_octohelm_storage_pkg_sqlbuilder.CastCol[RevisionID](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Revision{}).F("ID")),
	KubepkgID: github_com_octohelm_storage_pkg_sqlbuilder.CastCol[ID](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Revision{}).F("KubepkgID")),
	Digest:    github_com_octohelm_storage_pkg_sqlbuilder.CastCol[string](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Revision{}).F("Digest")),
	Spec:      github_com_octohelm_storage_pkg_sqlbuilder.CastCol[[]uint8](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Revision{}).F("Spec")),
	CreatedAt: github_com_octohelm_storage_pkg_sqlbuilder.CastCol[github_com_octohelm_storage_pkg_datatypes.Timestamp](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Revision{}).F("CreatedAt")),

	I: indexNameOfRevision{
		Primary: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Revision{}).Cols([]string{
			"ID",
		}...),
		IDigest: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Revision{}).Cols([]string{
			"KubepkgID",
			"Digest",
		}...),
	},
	table: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Revision{}),
}

func (Version) TableName() string {
	return "t_kubepkg_version"
}

func (Version) Primary() []string {
	return []string{
		"ID",
	}
}

func (Version) UniqueIndexes() github_com_octohelm_storage_pkg_sqlbuilder.Indexes {
	return github_com_octohelm_storage_pkg_sqlbuilder.Indexes{
		"i_version": []string{
			"KubepkgID",
			"Channel",
			"Version",
		},
	}
}

func (Version) Indexes() github_com_octohelm_storage_pkg_sqlbuilder.Indexes {
	return github_com_octohelm_storage_pkg_sqlbuilder.Indexes{
		"i_created_at": []string{
			"CreatedAt",
		},
		"i_semver": []string{
			"Major",
			"Minor",
			"Patch",
		},
	}
}

func init() {
	T.Add(VersionT)
}

func (tableVersion) New() github_com_octohelm_storage_pkg_sqlbuilder.Model {
	return &Version{}
}

func (t *tableVersion) IsNil() bool {
	return t.table.IsNil()
}

func (t *tableVersion) Ex(ctx context.Context) *github_com_octohelm_storage_pkg_sqlbuilder.Ex {
	return t.table.Ex(ctx)
}

func (t *tableVersion) TableName() string {
	return t.table.TableName()
}

func (t *tableVersion) F(name string) github_com_octohelm_storage_pkg_sqlbuilder.Column {
	return t.table.F(name)
}

func (t *tableVersion) K(name string) github_com_octohelm_storage_pkg_sqlbuilder.Key {
	return t.table.K(name)
}

func (t *tableVersion) Cols(names ...string) github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection {
	return t.table.Cols(names...)
}

func (t *tableVersion) Keys(names ...string) github_com_octohelm_storage_pkg_sqlbuilder.KeyCollection {
	return t.table.Keys(names...)
}

type tableVersion struct {
	I          indexNameOfVersion
	table      github_com_octohelm_storage_pkg_sqlbuilder.Table
	ID         github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[github_com_octohelm_storage_pkg_datatypes.SFID]
	KubepkgID  github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[ID]
	Version    github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[string]
	Major      github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[int]
	Minor      github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[int]
	Patch      github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[int]
	Channel    github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[Channel]
	RevisionID github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[RevisionID]
	CreatedAt  github_com_octohelm_storage_pkg_sqlbuilder.TypedColumn[github_com_octohelm_storage_pkg_datatypes.Timestamp]
}

type indexNameOfVersion struct {
	Primary  github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection
	IVersion github_com_octohelm_storage_pkg_sqlbuilder.ColumnCollection
}

var VersionT = &tableVersion{
	ID:         github_com_octohelm_storage_pkg_sqlbuilder.CastCol[github_com_octohelm_storage_pkg_datatypes.SFID](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Version{}).F("ID")),
	KubepkgID:  github_com_octohelm_storage_pkg_sqlbuilder.CastCol[ID](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Version{}).F("KubepkgID")),
	Version:    github_com_octohelm_storage_pkg_sqlbuilder.CastCol[string](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Version{}).F("Version")),
	Major:      github_com_octohelm_storage_pkg_sqlbuilder.CastCol[int](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Version{}).F("Major")),
	Minor:      github_com_octohelm_storage_pkg_sqlbuilder.CastCol[int](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Version{}).F("Minor")),
	Patch:      github_com_octohelm_storage_pkg_sqlbuilder.CastCol[int](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Version{}).F("Patch")),
	Channel:    github_com_octohelm_storage_pkg_sqlbuilder.CastCol[Channel](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Version{}).F("Channel")),
	RevisionID: github_com_octohelm_storage_pkg_sqlbuilder.CastCol[RevisionID](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Version{}).F("RevisionID")),
	CreatedAt:  github_com_octohelm_storage_pkg_sqlbuilder.CastCol[github_com_octohelm_storage_pkg_datatypes.Timestamp](github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Version{}).F("CreatedAt")),

	I: indexNameOfVersion{
		Primary: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Version{}).Cols([]string{
			"ID",
		}...),
		IVersion: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Version{}).Cols([]string{
			"KubepkgID",
			"Channel",
			"Version",
		}...),
	},
	table: github_com_octohelm_storage_pkg_sqlbuilder.TableFromModel(&Version{}),
}
