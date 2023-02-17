package specutil

import (
	"encoding/json"

	kubepkgv1alpha1 "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/util"
)

func ApplyOverwrites(kpkg *kubepkgv1alpha1.KubePkg) (*kubepkgv1alpha1.KubePkg, error) {
	if kpkg.Annotations != nil {
		if overwrites, ok := kpkg.Annotations[AnnotationOverwrites]; ok {
			kpkg2 := kpkg.DeepCopy()
			if err := json.Unmarshal(util.StringToBytes(overwrites), kpkg2); err != nil {
				return nil, err
			}
			delete(kpkg2.Annotations, AnnotationOverwrites)
			return kpkg2, nil
		}
	}
	return kpkg, nil
}
