package kubepkg

import (
	"github.com/octohelm/kubepkg/pkg/datatypes"
)

// +gengo:table:register=T
// +gengo:table:group=kubepkg
// @def primary ID
// @def unique_index i_digest KubepkgID Digest
// @def index i_created_at CreatedAt
type Revision struct {
	// Kubepkg Revision ID
	ID RevisionID `db:"f_revision_id" json:"0"`

	KubepkgID ID `db:"f_kubepkg_id" json:"-"`

	// hash of spec
	Digest string `db:"f_digest" json:"-"`
	// spec
	Spec []byte `db:"f_spec" json:"-"`

	datatypes.CreationTime
}

type RevisionID uint64

func (id *RevisionID) UnmarshalText(text []byte) error {
	return (*datatypes.SFID)(id).UnmarshalText(text)
}

func (id RevisionID) MarshalText() (text []byte, err error) {
	return datatypes.SFID(id).MarshalText()
}

func (id RevisionID) String() string {
	return datatypes.SFID(id).String()
}

// +gengo:enum
type Channel uint8

const (
	CHANNEL_UNKNOWN Channel = iota
	CHANNEL__DEV            // 开发
	CHANNEL__BETA           // 测试
	CHANNEL__RC             // 预览
	CHANNEL__STABLE         // 正式
)

type Ref struct {
	KubepkgID          ID
	KubepkgRevisionID  RevisionID
	SettingID          uint64
	Overwrites         map[string]any
	DefaultsOverwrites map[string]any
}

func (r Ref) WithSettingID(settingID uint64) *Ref {
	r.SettingID = settingID
	return &r
}
