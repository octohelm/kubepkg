package cluster

import "github.com/octohelm/kubepkg/pkg/datatypes"

// +gengo:table:register=T
// +gengo:table:group=cluster
// @def primary ID DeletedAt
// @def unique_index i_name Name
// @def index i_created_at CreatedAt
// @def index i_updated_at UpdatedAt
type Cluster struct {
	// 集群 ID
	ID ID `db:"f_cluster_id" json:"clusterID"`
	// 集群名称
	Name string `db:"f_cluster_name" json:"name"`

	Info

	datatypes.CreationUpdationDeletionTime
}

type Info struct {
	// 集群描述
	Desc string `db:"f_desc,default=''" json:"desc,omitempty"`
	// 集群环境类型
	EnvType EnvType `db:"f_env_type,default='1'" json:"envType"`
	// 网络环境
	// validate: string(required(),oneOf(['DIRECT','AIRGAP']))
	NetType NetType `db:"f_net_type,default='1'" json:"netType"`
	// Agent 地址
	// validate: when('netType',is('DIRECT'),then(string(required())))
	Endpoint string `db:"f_endpoint,default=''" json:"endpoint,omitempty"`
}

// +gengo:enum
type Status uint8

const (
	STATUS_UNKNOWN   Status = iota
	STATUS__ENABLED         // 可用
	STATUS__DISABLED        // 不可用
)

// +gengo:enum
type EnvType uint8

const (
	ENV_TYPE_UNKNOWN EnvType = iota
	ENV_TYPE__DEV            // 开发集群
	ENV_TYPE__ONLINE         // 生产集群
)

// +gengo:enum
type NetType uint8

const (
	NET_TYPE_UNKNOWN NetType = iota
	NET_TYPE__DIRECT         // 可直连
	NET_TYPE__AIRGAP         // 离线
)

type ID uint64

func (id *ID) UnmarshalText(text []byte) error {
	return (*datatypes.SFID)(id).UnmarshalText(text)
}

func (id ID) MarshalText() (text []byte, err error) {
	return datatypes.SFID(id).MarshalText()
}

func (id ID) String() string {
	return datatypes.SFID(id).String()
}
