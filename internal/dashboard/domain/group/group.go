package group

import "github.com/octohelm/kubepkg/pkg/datatypes"

// Group
// +gengo:table:register=T
// @def primary ID DeletedAt
// @def unique_index i_group_name Name
// @def index i_created_at CreatedAt
// @def index i_updated_at UpdatedAt
type Group struct {
	// 组织 ID
	ID ID `db:"f_group_id" json:"groupID"`
	// 组织名称
	Name string `db:"f_group_name" json:"name"`

	Info

	datatypes.CreationUpdationDeletionTime
}

type Info struct {
	// 组织描述
	Desc string `db:"f_group_desc,default=''" json:"desc,omitempty"`
}

type ID uint64

func (id *ID) UnmarshalText(text []byte) error {
	return (*datatypes.SFID)(id).UnmarshalText(text)
}

func (id ID) MarshalText() (text []byte, err error) {
	return datatypes.SFID(id).MarshalText()
}

func (id ID) String() string {
	return datatypes.SFID(id).String()
}
