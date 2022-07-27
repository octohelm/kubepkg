package kubepkg

import "github.com/octohelm/kubepkg/pkg/datatypes"

// +gengo:table:register=T
// +gengo:table:group=kubepkg
// @def primary ID
// @def unique_index i_version Channel Version
// @def index i_created_at CreatedAt
type Version struct {
	ID datatypes.SFID `db:"f_id" json:"-"`

	// 版本分支
	Channel Channel `db:"f_channel,default=1" json:"channel"`
	// 版本号
	Version string `db:"f_version" json:"version"`

	RevisionID RevisionID `db:"f_kubepkg_revision_id" json:"revisionID"`

	datatypes.CreationTime
}
