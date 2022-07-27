package group

import (
	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"
	"github.com/octohelm/kubepkg/pkg/datatypes"
)

// +gengo:table:register=T
// +gengo:table:group=group
//
// @def primary ID
// @def unique_index i_group_account GroupID AccountID
// @def index i_role_type RoleType
// @def index i_created_at CreatedAt
// @def index i_updated_at UpdatedAt
type Account struct {
	ID datatypes.SFID `db:"f_id" json:"-"`
	// 账户 ID
	AccountID account.ID `db:"f_account_id" json:"accountID"`
	// 组织 ID
	GroupID ID `db:"f_group_id" json:"groupID"`
	// 角色
	RoleType RoleType `db:"f_role_type" json:"roleType"`

	datatypes.CreationUpdationTime
}

// +gengo:enum
type RoleType uint8

const (
	ROLE_TYPE_UNKNOWN RoleType = iota
	ROLE_TYPE__OWNER           // 拥有者
	ROLE_TYPE__ADMIN           // 管理员
	ROLE_TYPE__MEMBER          // 成员
	ROLE_TYPE__GUEST           // 访问者
)

type RoleInfo struct {
	RoleType RoleType `json:"roleType"`
}
