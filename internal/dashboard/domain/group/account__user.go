package group

import (
	"github.com/octohelm/kubepkg/internal/dashboard/domain/account"
)

type User struct {
	Account
	account.UserInfo
}

type UserQueryParams struct {
	account.UserQueryParams
	RoleType []RoleType `name:"roleType,omitempty" in:"query"`
}

type UserDataList struct {
	Data  []*User `json:"data"`
	Total int     `json:"total"`
}

type RobotQueryParams struct {
	account.RobotQueryParams
	RoleType []RoleType `name:"roleType,omitempty" in:"query"`
}

type Robot struct {
	Account
	account.RobotInfo
}

type RobotDataList struct {
	Data  []*Robot `json:"data"`
	Total int      `json:"total"`
}
