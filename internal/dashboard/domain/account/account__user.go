package account

import "github.com/octohelm/kubepkg/pkg/datatypes"

type User struct {
	Account
	UserInfo
}

type UserInfo struct {
	Nickname string `json:"nickname,omitempty"`
	Email    string `json:"email,omitempty"`
	Mobile   string `json:"mobile,omitempty"`
}

func (u *UserInfo) ValueFromIdentity(i *Identity) {
	switch i.IdentityType {
	case IDENTITY_TYPE__EMAIL:
		u.Email = i.Identity
	case IDENTITY_TYPE__MOBILE:
		u.Mobile = i.Identity
	case IDENTITY_TYPE__NICKNAME:
		u.Nickname = i.Identity
	}
}

type UserQueryParams struct {
	AccountIDs []ID     `name:"accountID,omitempty" in:"query"`
	Identity   []string `name:"identity,omitempty" in:"query"`

	datatypes.Pager
}

type UserDataList struct {
	Data  []*User `json:"data"`
	Total int     `json:"total"`
}

type Robot struct {
	Account
	RobotInfo
}

type RobotInfo struct {
	Name string `json:"name"`
}

func (r *RobotInfo) ValueFromIdentity(i *Identity) {
	if i.IdentityType == IDENTITY_TYPE__NICKNAME {
		r.Name = i.Identity
	}
}

type RobotQueryParams struct {
	AccountIDs []ID     `name:"accountID,omitempty" in:"query"`
	Identity   []string `name:"identity,omitempty" in:"query"`
	datatypes.Pager
}
