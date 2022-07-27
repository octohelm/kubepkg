package group

import (
	"github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg"
	"github.com/octohelm/kubepkg/pkg/datatypes"
)

// +gengo:table:register=T
// +gengo:table:group=group
// @def primary DeploymentID
// @def unique_index i_deployment_name GroupEnvID DeploymentName
// @def index i_updated_at CreatedAt
// @def index i_updated_at UpdatedAt
type Deployment struct {
	GroupEnvID EnvID `db:"f_group_env_id" json:"groupEnvID"`

	DeploymentID DeploymentID `db:"f_deployment_id" json:"-"`

	// DeploymentName default is EnvName of Kubepkg
	DeploymentName string `db:"f_deployment_name" json:"deploymentName"`

	KubepkgRel

	datatypes.CreationUpdationTime
}

type KubepkgRel struct {
	// KubepkgID which to  bind kubepkg
	KubepkgID      kubepkg.ID      `db:"f_kubepkg_id" json:"kubepkgID"`
	KubepkgChannel kubepkg.Channel `db:"f_kubepkg_channel" json:"channel"`
}

type DeploymentID uint64

func (id *DeploymentID) UnmarshalText(text []byte) error {
	return (*datatypes.SFID)(id).UnmarshalText(text)
}

func (id DeploymentID) MarshalText() (text []byte, err error) {
	return datatypes.SFID(id).MarshalText()
}

func (id DeploymentID) String() string {
	return datatypes.SFID(id).String()
}
