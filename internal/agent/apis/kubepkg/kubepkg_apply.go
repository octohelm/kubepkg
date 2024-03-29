package kubepkg

import (
	"context"

	"github.com/go-courier/logr"
	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubepkg/controller"
	kubeutilclient "github.com/octohelm/kubepkg/pkg/kubeutil/client"
	v1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

// 部署部署包
type ApplyKubePkg struct {
	courierhttp.MethodPut `path:"/kubepkgs"`
	// 通过 KubePkg.json 部署
	KubePkg *v1alpha1.KubePkg `in:"body"`
}

func (req *ApplyKubePkg) Output(ctx context.Context) (any, error) {
	kpkgs := make([]*v1alpha1.KubePkg, 0)
	if req.KubePkg != nil {
		kpkgs = append(kpkgs, req.KubePkg)
	}

	namespaces := map[string]bool{}

	c := kubeutilclient.ClientFromContext(ctx)

	for i := range kpkgs {
		kpkg := kpkgs[i]

		if kpkg.Namespace == "" {
			kpkg.Namespace = "default"
		}

		if _, ok := namespaces[kpkg.Namespace]; !ok {
			n := &v1.Namespace{}
			n.Name = kpkg.Namespace

			if err := c.Get(ctx, client.ObjectKeyFromObject(n), n); err != nil {
				if !apierrors.IsNotFound(err) {
					return nil, err
				}
				if err := c.Create(ctx, n); err != nil {
					return nil, err
				}
			}

			namespaces[kpkg.Namespace] = true
		}

		logr.FromContext(ctx).WithValues(
			"name", kpkg.Name,
			"namespace", kpkg.Namespace,
			"version", kpkg.Spec.Version,
		).Info("Applying")

		if err := c.Patch(ctx, &v1alpha1.KubePkg{
			TypeMeta:   kpkg.TypeMeta,
			ObjectMeta: kpkg.ObjectMeta,
			Spec:       kpkg.Spec,
		}, client.Apply, controller.FieldOwner, client.ForceOwnership); err != nil {
			return nil, err
		}
	}

	return nil, nil
}
