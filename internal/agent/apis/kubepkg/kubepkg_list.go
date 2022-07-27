package kubepkg

import (
	"context"
	"net/http"

	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubeutil"

	"github.com/octohelm/courier/pkg/courierhttp"
)

// 部署包列表
type ListKubePkg struct {
	courierhttp.MethodGet `path:"/kubepkgs"`
}

func (req *ListKubePkg) Output(ctx context.Context) (any, error) {
	list := &v1alpha1.KubePkgList{}

	if err := kubeutil.ClientFromContext(ctx).List(ctx, list); err != nil {
		return nil, statuserror.Wrap(err, http.StatusInternalServerError, "RequestK8sFailed")
	}

	if list.Items == nil {
		list.Items = []v1alpha1.KubePkg{}
	}

	return list.Items, nil
}
