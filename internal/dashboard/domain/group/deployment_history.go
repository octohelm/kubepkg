package group

import (
	"github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg"
	"github.com/octohelm/kubepkg/pkg/datatypes"
)

// +gengo:table:register=T
// +gengo:table:group=group
// @def primary DeploymentHistoryID
// @def index i_deployment DeploymentID
// @def index i_kubepkg KubepkgID
// @def index i_kubepkg_revision KubepkgRevisionID
// @def index i_updated_at CreatedAt
type DeploymentHistory struct {
	DeploymentID        DeploymentID        `db:"f_deployment_id" json:"deploymentID"`
	DeploymentHistoryID DeploymentHistoryID `db:"f_deployment_history_id" json:"deploymentHistoryID"`
	KubepkgID           kubepkg.ID          `db:"f_kubepkg_id" json:"kubepkgID"`
	KubepkgRevisionID   kubepkg.RevisionID  `db:"f_kubepkg_revision_id,default=0" json:"kubepkgRevisionID"`
	DeploymentSettingID DeploymentSettingID `db:"f_deployment_setting_id,default=0" json:"deploymentSettingID"`
	datatypes.CreationTime
}

type DeploymentHistoryID uint64

func (id *DeploymentHistoryID) UnmarshalText(text []byte) error {
	return (*datatypes.SFID)(id).UnmarshalText(text)
}

func (id DeploymentHistoryID) MarshalText() (text []byte, err error) {
	return datatypes.SFID(id).MarshalText()
}

func (id DeploymentHistoryID) String() string {
	return datatypes.SFID(id).String()
}
