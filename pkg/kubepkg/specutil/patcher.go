package specutil

import (
	"encoding/json"
	"io"

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

func transform(from any, to any) error {
	r, w := io.Pipe()
	e := json.NewEncoder(w)
	go func() {
		defer w.Close()
		_ = e.Encode(from)
	}()
	d := json.NewDecoder(r)
	if err := d.Decode(&to); err != nil {
		return err
	}
	return nil
}

func merge(kpkg *kubepkgv1alpha1.KubePkg, overwrites []byte) (*kubepkgv1alpha1.KubePkg, error) {
	var srcObj objx.Map
	if err := transform(kpkg, &srcObj); err != nil {
		return nil, err
	}
	var overwritesObj objx.Map
	if err := json.Unmarshal(overwrites, &overwritesObj); err != nil {
		return nil, err
	}

	merged := DeepMerge(srcObj, overwritesObj)
	var m kubepkgv1alpha1.KubePkg
	if err := transform(merged, &m); err != nil {
		return nil, err
	}
	return &m, nil
}

func DeepMerge(from objx.Map, patch objx.Map) objx.Map {
	mergedKeys := map[string]bool{}

	merged := from.Transform(func(key string, currValue interface{}) (string, interface{}) {
		mergedKeys[key] = true

		if patchValue := patch.Get(key); !patchValue.IsNil() {
			if patchValue.IsObjxMap() {
				switch x := currValue.(type) {
				case objx.Map:
					return key, DeepMerge(x, patchValue.MustObjxMap())
				case map[string]any:
					return key, DeepMerge(x, patchValue.MustObjxMap())
				}
			}
			return key, patchValue.Data()
		}

		return key, currValue
	})

	for key := range patch {
		if _, ok := mergedKeys[key]; !ok {
			merged[key] = patch[key]
		}
	}

	return merged
}
