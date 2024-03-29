/*
Package account GENERATED BY gengo:enum 
DON'T EDIT THIS FILE
*/
package account

import (
	bytes "bytes"
	database_sql_driver "database/sql/driver"

	github_com_octohelm_storage_pkg_enumeration "github.com/octohelm/storage/pkg/enumeration"
	github_com_pkg_errors "github.com/pkg/errors"
)

var InvalidIdentityType = github_com_pkg_errors.New("invalid IdentityType")

func (IdentityType) EnumValues() []any {
	return []any{
		IDENTITY_TYPE__MOBILE, IDENTITY_TYPE__EMAIL, IDENTITY_TYPE__NICKNAME,
	}
}
func (v IdentityType) MarshalText() ([]byte, error) {
	str := v.String()
	if str == "UNKNOWN" {
		return nil, InvalidIdentityType
	}
	return []byte(str), nil
}

func (v *IdentityType) UnmarshalText(data []byte) error {
	vv, err := ParseIdentityTypeFromString(string(bytes.ToUpper(data)))
	if err != nil {
		return err
	}
	*v = vv
	return nil
}

func ParseIdentityTypeFromString(s string) (IdentityType, error) {
	switch s {
	case "MOBILE":
		return IDENTITY_TYPE__MOBILE, nil
	case "EMAIL":
		return IDENTITY_TYPE__EMAIL, nil
	case "NICKNAME":
		return IDENTITY_TYPE__NICKNAME, nil

	}
	return IDENTITY_TYPE_UNKNOWN, InvalidIdentityType
}

func (v IdentityType) String() string {
	switch v {
	case IDENTITY_TYPE__MOBILE:
		return "MOBILE"
	case IDENTITY_TYPE__EMAIL:
		return "EMAIL"
	case IDENTITY_TYPE__NICKNAME:
		return "NICKNAME"

	}
	return "UNKNOWN"
}

func ParseIdentityTypeLabelString(label string) (IdentityType, error) {
	switch label {
	case "手机号":
		return IDENTITY_TYPE__MOBILE, nil
	case "邮箱":
		return IDENTITY_TYPE__EMAIL, nil
	case "昵称":
		return IDENTITY_TYPE__NICKNAME, nil

	}
	return IDENTITY_TYPE_UNKNOWN, InvalidIdentityType
}

func (v IdentityType) Label() string {
	switch v {
	case IDENTITY_TYPE__MOBILE:
		return "手机号"
	case IDENTITY_TYPE__EMAIL:
		return "邮箱"
	case IDENTITY_TYPE__NICKNAME:
		return "昵称"

	}
	return "UNKNOWN"
}

func (v IdentityType) Value() (database_sql_driver.Value, error) {
	offset := 0
	if o, ok := any(v).(github_com_octohelm_storage_pkg_enumeration.DriverValueOffset); ok {
		offset = o.Offset()
	}
	return int64(v) + int64(offset), nil
}

func (v *IdentityType) Scan(src any) error {
	offset := 0
	if o, ok := any(v).(github_com_octohelm_storage_pkg_enumeration.DriverValueOffset); ok {
		offset = o.Offset()
	}

	i, err := github_com_octohelm_storage_pkg_enumeration.ScanIntEnumStringer(src, offset)
	if err != nil {
		return err
	}
	*v = IdentityType(i)
	return nil
}

var InvalidType = github_com_pkg_errors.New("invalid Type")

func (Type) EnumValues() []any {
	return []any{
		TYPE__USER, TYPE__ROBOT, TYPE__AGENT,
	}
}
func (v Type) MarshalText() ([]byte, error) {
	str := v.String()
	if str == "UNKNOWN" {
		return nil, InvalidType
	}
	return []byte(str), nil
}

func (v *Type) UnmarshalText(data []byte) error {
	vv, err := ParseTypeFromString(string(bytes.ToUpper(data)))
	if err != nil {
		return err
	}
	*v = vv
	return nil
}

func ParseTypeFromString(s string) (Type, error) {
	switch s {
	case "USER":
		return TYPE__USER, nil
	case "ROBOT":
		return TYPE__ROBOT, nil
	case "AGENT":
		return TYPE__AGENT, nil

	}
	return TYPE_UNKNOWN, InvalidType
}

func (v Type) String() string {
	switch v {
	case TYPE__USER:
		return "USER"
	case TYPE__ROBOT:
		return "ROBOT"
	case TYPE__AGENT:
		return "AGENT"

	}
	return "UNKNOWN"
}

func ParseTypeLabelString(label string) (Type, error) {
	switch label {
	case "USER":
		return TYPE__USER, nil
	case "ROBOT":
		return TYPE__ROBOT, nil
	case "AGENT":
		return TYPE__AGENT, nil

	}
	return TYPE_UNKNOWN, InvalidType
}

func (v Type) Label() string {
	switch v {
	case TYPE__USER:
		return "USER"
	case TYPE__ROBOT:
		return "ROBOT"
	case TYPE__AGENT:
		return "AGENT"

	}
	return "UNKNOWN"
}

func (v Type) Value() (database_sql_driver.Value, error) {
	offset := 0
	if o, ok := any(v).(github_com_octohelm_storage_pkg_enumeration.DriverValueOffset); ok {
		offset = o.Offset()
	}
	return int64(v) + int64(offset), nil
}

func (v *Type) Scan(src any) error {
	offset := 0
	if o, ok := any(v).(github_com_octohelm_storage_pkg_enumeration.DriverValueOffset); ok {
		offset = o.Offset()
	}

	i, err := github_com_octohelm_storage_pkg_enumeration.ScanIntEnumStringer(src, offset)
	if err != nil {
		return err
	}
	*v = Type(i)
	return nil
}
