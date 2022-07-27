package kubepkg

import (
	"context"
	"net/http"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

// 查询部署包
type GetKubePkg struct {
	courierhttp.MethodGet `path:"/kubepkgs/:name"`
	Name                  string `in:"path" name:"name"`
	Namespace             string `in:"query" name:"namespace,omitempty" default:"default"`
}

func (req *GetKubePkg) Output(ctx context.Context) (any, error) {
	kpkg := &v1alpha1.KubePkg{}
	kpkg.SetGroupVersionKind(v1alpha1.SchemeGroupVersion.WithKind("KubePkg"))

	kpkg.Name = req.Name
	kpkg.Namespace = req.Namespace

	if err := kubeutil.ClientFromContext(ctx).Get(ctx, client.ObjectKeyFromObject(kpkg), kpkg); err != nil {
		return nil, statuserror.Wrap(err, http.StatusInternalServerError, "RequestK8sFailed")
	}

	return kpkg, nil
}
