package manifest

import (
	"github.com/octohelm/kubepkg/pkg/annotation"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
)

func ExtractComplete(kpkg *v1alpha1.KubePkg) (map[string]Object, error) {
	final := map[string]Object{}

	manifests, err := ManifestsFromSpec(kpkg)
	if err != nil {
		return nil, err
	}
	for k := range manifests {
		final[k] = manifests[k]
		kubeutil.Label(final[k], annotation.LabelAppName, kpkg.Name)
	}

	wildcardManifests, err := ManifestsFromWildcard(kpkg)
	if err != nil {
		return nil, err
	}
	for k := range wildcardManifests {
		final[k] = wildcardManifests[k]
		kubeutil.Label(final[k], annotation.LabelAppName, kpkg.Name)
	}

	return final, nil
}
