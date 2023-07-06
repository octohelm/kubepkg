package cluster

import (
	"context"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/pkg/kubeutil/clusterinfo"
)

// 获取集群信息
type GetClusterInfo struct {
	courierhttp.MethodGet `path:"/cluster"`
}

func (req *GetClusterInfo) Output(ctx context.Context) (any, error) {
	return clusterinfo.FromContext(ctx), nil
}
