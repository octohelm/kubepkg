package specutil

import (
	"encoding/json"

	kubepkgv1alpha1 "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/util"
	"github.com/stretchr/objx"
)

func ApplyOverwrites(kpkg *kubepkgv1alpha1.KubePkg) (*kubepkgv1alpha1.KubePkg, error) {
	if kpkg.Annotations != nil {
		if overwrites, ok := kpkg.Annotations[AnnotationOverwrites]; ok {
			merged, err := merge(kpkg, util.StringToBytes(overwrites))
			if err != nil {
				return nil, err
			}
			delete(merged.Annotations, AnnotationOverwrites)
			return merged, nil
		}
	}
	return kpkg, nil
}

func merge(kpkg *kubepkgv1alpha1.KubePkg, overwrites []byte) (*kubepkgv1alpha1.KubePkg, error) {
	var srcObj objx.Map
	if err := util.DecodeTo(kpkg, &srcObj); err != nil {
		return nil, err
	}
	var overwritesObj objx.Map
	if err := json.Unmarshal(overwrites, &overwritesObj); err != nil {
		return nil, err
	}
	merged := util.MergeObj(srcObj, overwritesObj)
	var m kubepkgv1alpha1.KubePkg
	if err := util.DecodeTo(merged, &m); err != nil {
		return nil, err
	}
	return &m, nil
}
