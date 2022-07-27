package group

import (
	"github.com/octohelm/kubepkg/pkg/datatypes"
)

// +gengo:table:register=T
// +gengo:table:group=group
// @def primary EnvID DeletedAt
// @def unique_index i_env_name EnvID EnvName
// @def index i_env_type EnvType
// @def index i_bind_clusterID ClusterID
// @def index i_created_at CreatedAt
// @def index i_updated_at UpdatedAt
type Env struct {
	EnvID EnvID `db:"f_env_id" json:"envID"`
	// 组织 ID
	GroupID ID `db:"f_group_id" json:"groupID"`

	EnvName string `db:"f_env_name" json:"envName"`

	EnvInfo

	EnvCluster

	RandPassword []byte `db:"f_rand_pwd,null" json:"-"`

	datatypes.CreationUpdationDeletionTime
}

type EnvInfo struct {
	// 环境描述
	Desc string `db:"f_desc" json:"desc"`
	// 环境类型
	EnvType EnvType `db:"f_env_type,default='1'" json:"envType"`
}

type EnvCluster struct {
	// 关联集群
	ClusterID datatypes.SFID `db:"f_cluster_id,default=0" json:"clusterID"`
	// 对应 namespace
	// <group>--<env-name>
	Namespace string `db:"f_namespace,default=''" json:"-"`
}

// +gengo:enum
type EnvType uint8

const (
	ENV_TYPE_UNKNOWN EnvType = iota
	ENV_TYPE__DEV            // 开发环境
	ENV_TYPE__ONLINE         // 线上环境
)

type EnvID uint64

func (id *EnvID) UnmarshalText(text []byte) error {
	return (*datatypes.SFID)(id).UnmarshalText(text)
}

func (id EnvID) MarshalText() (text []byte, err error) {
	return datatypes.SFID(id).MarshalText()
}

func (id EnvID) String() string {
	return datatypes.SFID(id).String()
}
