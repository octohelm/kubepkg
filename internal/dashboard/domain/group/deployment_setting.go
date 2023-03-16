package group

import (
	"github.com/octohelm/kubepkg/pkg/datatypes"
)

// +gengo:table:register=T
// +gengo:table:group=group
// @def primary DeploymentSettingID
// @def unique_index i_hash DeploymentID Digest
// @def index i_updated_at CreatedAt
type DeploymentSetting struct {
	DeploymentSettingID DeploymentSettingID `db:"f_deployment_setting_id" json:"deploymentSettingID"`
	DeploymentID        DeploymentID        `db:"f_deployment_id" json:"deploymentID"`
	Digest              string              `db:"f_digest" json:"digest"`
	EncryptedSetting    []byte              `db:"f_setting" json:"-"`
	datatypes.CreationTime
}

type DeploymentSettingID uint64

func (id *DeploymentSettingID) UnmarshalText(text []byte) error {
	return (*datatypes.SFID)(id).UnmarshalText(text)
}

func (id DeploymentSettingID) MarshalText() (text []byte, err error) {
	return datatypes.SFID(id).MarshalText()
}

func (id DeploymentSettingID) String() string {
	return datatypes.SFID(id).String()
}

type DeploymentValues struct {
	DeploymentSettingID DeploymentSettingID
	Values              map[string]any
}
