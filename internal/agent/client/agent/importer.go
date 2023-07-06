package agent

import (
	"context"

	"github.com/go-courier/logr"
	"github.com/octohelm/kubepkg/pkg/kubeutil/clusterinfo"

	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
)

func AgentInfo(ctx context.Context) (*clusterinfo.ClusterInfo, error) {
	data := &clusterinfo.ClusterInfo{}
	_, err := (&GetClusterInfo{}).Do(ctx).Into(data)
	return data, err
}

func ImportKubePkg(ctx context.Context, kubePkgs ...*v1alpha1.KubePkg) error {
	for i := range kubePkgs {
		kubePkg := kubePkgs[i]
		if _, err := (&ApplyKubePkg{
			ApisKubepkgV1Alpha1KubePkg: *kubePkg,
		}).Invoke(logr.WithLogger(ctx, logr.Discard())); err != nil {
			return err
		}
		logr.FromContext(ctx).Info("applying KubePkg %s.%s (%s)", kubePkg.Namespace, kubePkg.Name, kubePkg.Spec.Version)
	}
	return nil
}
