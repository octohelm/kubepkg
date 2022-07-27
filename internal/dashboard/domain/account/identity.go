package account

import (
	"github.com/octohelm/kubepkg/pkg/datatypes"
)

// +gengo:table:group=account
// +gengo:table:register=T
// @def primary ID
// @def unique_index i_account_identity IdentityType Identity
// @def index i_account AccountID
// @def index i_created_at CreatedAt
// @def index i_updated_at UpdatedAt
type Identity struct {
	AccountID    ID           `db:"f_account_id" json:"accountID"`
	IdentityType IdentityType `db:"f_identity_type" json:"identityType"`
	Identity     string       `db:"f_identity" json:"identity"`

	datatypes.PrimaryID
	datatypes.CreationUpdationTime
}

// +gengo:enum
type IdentityType uint8

const (
	IDENTITY_TYPE_UNKNOWN   IdentityType = iota
	IDENTITY_TYPE__MOBILE                // 手机号
	IDENTITY_TYPE__EMAIL                 // 邮箱
	IDENTITY_TYPE__NICKNAME              // 昵称
)
