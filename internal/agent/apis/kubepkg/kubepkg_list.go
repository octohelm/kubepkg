package kubepkg

import (
	"context"
	"net/http"

	kubeutilclient "github.com/octohelm/kubepkg/pkg/kubeutil/client"

	"sigs.k8s.io/controller-runtime/pkg/client"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
)

// 部署包列表
type ListKubePkg struct {
	courierhttp.MethodGet `path:"/kubepkgs"`
	Namespace             string `name:"namespace,omitempty" in:"query"`
}

func (req *ListKubePkg) Output(ctx context.Context) (any, error) {
	list := &v1alpha1.KubePkgList{}

	if err := kubeutilclient.ClientFromContext(ctx).List(ctx, list, client.InNamespace(req.Namespace)); err != nil {
		return nil, statuserror.Wrap(err, http.StatusInternalServerError, "RequestK8sFailed")
	}

	if list.Items == nil {
		list.Items = []v1alpha1.KubePkg{}
	}

	return list.Items, nil
}
