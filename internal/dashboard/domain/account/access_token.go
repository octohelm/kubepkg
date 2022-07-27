package account

import "github.com/octohelm/kubepkg/pkg/datatypes"

// +gengo:table:group=account
// +gengo:table:register=T
// @def primary ID
// @def index i_account AccountID
// @def index i_expires_at ExpiresAt
// @def index i_created_at CreatedAt
type AccessToken struct {
	ID datatypes.SFID `db:"f_id" json:"-"`

	AccountID ID `db:"f_account_id" json:"accountID"`

	Desc string `db:"f_desc" json:"desc"`
	// 过期时间
	ExpiresAt datatypes.Timestamp `db:"f_expires_at,default=0" json:"expiresAt"`

	datatypes.CreationTime
}
