/*
Package cluster GENERATED BY gengo:enum 
DON'T EDIT THIS FILE
*/
package cluster

import (
	bytes "bytes"
	database_sql_driver "database/sql/driver"

	github_com_octohelm_storage_pkg_enumeration "github.com/octohelm/storage/pkg/enumeration"
	github_com_pkg_errors "github.com/pkg/errors"
)

var InvalidEnvType = github_com_pkg_errors.New("invalid EnvType")

func (EnvType) EnumValues() []any {
	return []any{
		ENV_TYPE__DEV, ENV_TYPE__ONLINE,
	}
}
func (v EnvType) MarshalText() ([]byte, error) {
	str := v.String()
	if str == "UNKNOWN" {
		return nil, InvalidEnvType
	}
	return []byte(str), nil
}

func (v *EnvType) UnmarshalText(data []byte) error {
	vv, err := ParseEnvTypeFromString(string(bytes.ToUpper(data)))
	if err != nil {
		return err
	}
	*v = vv
	return nil
}

func ParseEnvTypeFromString(s string) (EnvType, error) {
	switch s {
	case "DEV":
		return ENV_TYPE__DEV, nil
	case "ONLINE":
		return ENV_TYPE__ONLINE, nil

	}
	return ENV_TYPE_UNKNOWN, InvalidEnvType
}

func (v EnvType) String() string {
	switch v {
	case ENV_TYPE__DEV:
		return "DEV"
	case ENV_TYPE__ONLINE:
		return "ONLINE"

	}
	return "UNKNOWN"
}

func ParseEnvTypeLabelString(label string) (EnvType, error) {
	switch label {
	case "开发集群":
		return ENV_TYPE__DEV, nil
	case "生产集群":
		return ENV_TYPE__ONLINE, nil

	}
	return ENV_TYPE_UNKNOWN, InvalidEnvType
}

func (v EnvType) Label() string {
	switch v {
	case ENV_TYPE__DEV:
		return "开发集群"
	case ENV_TYPE__ONLINE:
		return "生产集群"

	}
	return "UNKNOWN"
}

func (v EnvType) Value() (database_sql_driver.Value, error) {
	offset := 0
	if o, ok := any(v).(github_com_octohelm_storage_pkg_enumeration.DriverValueOffset); ok {
		offset = o.Offset()
	}
	return int64(v) + int64(offset), nil
}

func (v *EnvType) Scan(src any) error {
	offset := 0
	if o, ok := any(v).(github_com_octohelm_storage_pkg_enumeration.DriverValueOffset); ok {
		offset = o.Offset()
	}

	i, err := github_com_octohelm_storage_pkg_enumeration.ScanIntEnumStringer(src, offset)
	if err != nil {
		return err
	}
	*v = EnvType(i)
	return nil
}

var InvalidNetType = github_com_pkg_errors.New("invalid NetType")

func (NetType) EnumValues() []any {
	return []any{
		NET_TYPE__DIRECT, NET_TYPE__AIRGAP,
	}
}
func (v NetType) MarshalText() ([]byte, error) {
	str := v.String()
	if str == "UNKNOWN" {
		return nil, InvalidNetType
	}
	return []byte(str), nil
}

func (v *NetType) UnmarshalText(data []byte) error {
	vv, err := ParseNetTypeFromString(string(bytes.ToUpper(data)))
	if err != nil {
		return err
	}
	*v = vv
	return nil
}

func ParseNetTypeFromString(s string) (NetType, error) {
	switch s {
	case "DIRECT":
		return NET_TYPE__DIRECT, nil
	case "AIRGAP":
		return NET_TYPE__AIRGAP, nil

	}
	return NET_TYPE_UNKNOWN, InvalidNetType
}

func (v NetType) String() string {
	switch v {
	case NET_TYPE__DIRECT:
		return "DIRECT"
	case NET_TYPE__AIRGAP:
		return "AIRGAP"

	}
	return "UNKNOWN"
}

func ParseNetTypeLabelString(label string) (NetType, error) {
	switch label {
	case "可直连":
		return NET_TYPE__DIRECT, nil
	case "离线":
		return NET_TYPE__AIRGAP, nil

	}
	return NET_TYPE_UNKNOWN, InvalidNetType
}

func (v NetType) Label() string {
	switch v {
	case NET_TYPE__DIRECT:
		return "可直连"
	case NET_TYPE__AIRGAP:
		return "离线"

	}
	return "UNKNOWN"
}

func (v NetType) Value() (database_sql_driver.Value, error) {
	offset := 0
	if o, ok := any(v).(github_com_octohelm_storage_pkg_enumeration.DriverValueOffset); ok {
		offset = o.Offset()
	}
	return int64(v) + int64(offset), nil
}

func (v *NetType) Scan(src any) error {
	offset := 0
	if o, ok := any(v).(github_com_octohelm_storage_pkg_enumeration.DriverValueOffset); ok {
		offset = o.Offset()
	}

	i, err := github_com_octohelm_storage_pkg_enumeration.ScanIntEnumStringer(src, offset)
	if err != nil {
		return err
	}
	*v = NetType(i)
	return nil
}

var InvalidStatus = github_com_pkg_errors.New("invalid Status")

func (Status) EnumValues() []any {
	return []any{
		STATUS__ENABLED, STATUS__DISABLED,
	}
}
func (v Status) MarshalText() ([]byte, error) {
	str := v.String()
	if str == "UNKNOWN" {
		return nil, InvalidStatus
	}
	return []byte(str), nil
}

func (v *Status) UnmarshalText(data []byte) error {
	vv, err := ParseStatusFromString(string(bytes.ToUpper(data)))
	if err != nil {
		return err
	}
	*v = vv
	return nil
}

func ParseStatusFromString(s string) (Status, error) {
	switch s {
	case "ENABLED":
		return STATUS__ENABLED, nil
	case "DISABLED":
		return STATUS__DISABLED, nil

	}
	return STATUS_UNKNOWN, InvalidStatus
}

func (v Status) String() string {
	switch v {
	case STATUS__ENABLED:
		return "ENABLED"
	case STATUS__DISABLED:
		return "DISABLED"

	}
	return "UNKNOWN"
}

func ParseStatusLabelString(label string) (Status, error) {
	switch label {
	case "可用":
		return STATUS__ENABLED, nil
	case "不可用":
		return STATUS__DISABLED, nil

	}
	return STATUS_UNKNOWN, InvalidStatus
}

func (v Status) Label() string {
	switch v {
	case STATUS__ENABLED:
		return "可用"
	case STATUS__DISABLED:
		return "不可用"

	}
	return "UNKNOWN"
}

func (v Status) Value() (database_sql_driver.Value, error) {
	offset := 0
	if o, ok := any(v).(github_com_octohelm_storage_pkg_enumeration.DriverValueOffset); ok {
		offset = o.Offset()
	}
	return int64(v) + int64(offset), nil
}

func (v *Status) Scan(src any) error {
	offset := 0
	if o, ok := any(v).(github_com_octohelm_storage_pkg_enumeration.DriverValueOffset); ok {
		offset = o.Offset()
	}

	i, err := github_com_octohelm_storage_pkg_enumeration.ScanIntEnumStringer(src, offset)
	if err != nil {
		return err
	}
	*v = Status(i)
	return nil
}
