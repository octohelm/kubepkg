package kubepkg

import "github.com/octohelm/kubepkg/pkg/datatypes"

// +gengo:table:register=T
// +gengo:table:group=kubepkg
// @def primary ID DeletedAt
// @def unique_index i_name Group Name
// @def index i_created_at CreatedAt
// @def index i_updated_at UpdatedAt
type Kubepkg struct {
	// Kubepkg ID
	ID ID `db:"f_kubepkg_id" json:"kubepkgID"`

	// Kubepkg Group
	Group string `db:"f_group" json:"group"`
	// Kubepkg 名称
	Name string `db:"f_name" json:"name"`

	datatypes.CreationUpdationDeletionTime
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

// TODO add Label for Kubepkg
