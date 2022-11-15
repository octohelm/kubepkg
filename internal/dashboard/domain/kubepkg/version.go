package kubepkg

import "github.com/octohelm/kubepkg/pkg/datatypes"

// +gengo:table:register=T
// +gengo:table:group=kubepkg
// @def primary ID
// @def unique_index i_version KubepkgID Channel Version
// @def index i_semver Major Minor Patch
// @def index i_created_at CreatedAt
type Version struct {
	ID datatypes.SFID `db:"f_id" json:"-"`

	KubepkgID ID `db:"f_kubepkg_id" json:"kubepkgID"`
	// 版本号
	Version string `db:"f_version" json:"version"`

	Major int `db:"major,default=0" json:"-"`
	Minor int `db:"minor,default=0" json:"-"`
	Patch int `db:"patch,default=0" json:"-"`

	// 版本分支
	Channel Channel `db:"f_channel,default=1" json:"channel"`

	RevisionID RevisionID `db:"f_kubepkg_revision_id" json:"revisionID"`

	datatypes.CreationTime
}

type VersionInfo struct {
	RevisionID RevisionID `json:"revisionID"`
	Version    string     `json:"version"`
}
