package account

import "github.com/octohelm/kubepkg/pkg/datatypes"

// Account
// +gengo:table:register=T
// @def primary ID
// @def unique_index i_account AccountID DeletedAt
// @def index i_account_type AccountType
// @def index i_created_at CreatedAt
// @def index i_updated_at UpdatedAt
type Account struct {
	AccountID   ID   `db:"f_account_id" json:"accountID"`
	AccountType Type `db:"f_account_type" json:"accountType"`

	datatypes.PrimaryID
	datatypes.CreationUpdationDeletionTime
}

// +gengo:enum
type Type uint8

const (
	TYPE_UNKNOWN Type = iota
	TYPE__USER
	TYPE__ROBOT
)

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
