package kubepkg

import (
	"context"
	"io"
	"net/http"

	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	"github.com/pkg/errors"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubepkg/controller"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

// 部署部署包
type ApplyKubePkg struct {
	courierhttp.MethodPut `path:"/kubepkgs"`
	// 通过 Kubepkg.json 部署
	KubePkg *v1alpha1.KubePkg `in:"body" mime:"json,strict"`
	// 通过 Kubepkg.tgz 部署
	KubePkgTgz io.ReadCloser `in:"body" mime:"octet-stream,strict"`
}

func (req *ApplyKubePkg) Output(ctx context.Context) (any, error) {
	kpkg := req.KubePkg

	if kpkg == nil {
		if req.KubePkgTgz == nil {
			return nil, statuserror.Wrap(errors.New("missing request body"), http.StatusBadRequest, "NoRequestBody")
		}
		defer req.KubePkgTgz.Close()

		k, err := kubepkg.RegistryFromContext(ctx).ImportFromKubeTgzReader(ctx, req.KubePkgTgz)
		if err != nil {
			return nil, statuserror.Wrap(err, http.StatusBadRequest, "ReadKubePkgTgzFailed")
		}
		kpkg = k
	}

	if err := kubeutil.ClientFromContext(ctx).Patch(ctx, &v1alpha1.KubePkg{
		TypeMeta:   kpkg.TypeMeta,
		ObjectMeta: kpkg.ObjectMeta,
		Spec:       kpkg.Spec,
	}, client.Apply, controller.FieldOwner, client.ForceOwnership); err != nil {
		return nil, err
	}

	return kpkg, nil
}