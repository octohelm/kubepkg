package util

import (
	"encoding/json"
	"io"

	"github.com/stretchr/objx"
)

func Merge[X any](from *X, overwrites *X) (*X, error) {
	var srcObj objx.Map
	if err := DecodeTo(from, &srcObj); err != nil {
		return nil, err
	}
	var overwritesObj objx.Map
	if err := DecodeTo(overwrites, &overwritesObj); err != nil {
		return nil, err
	}

	merged := DeepMerge(srcObj, overwritesObj)
	m := new(X)
	if err := DecodeTo(merged, m); err != nil {
		return nil, err
	}
	return m, nil
}

func DeepMerge(from objx.Map, patch objx.Map) objx.Map {
	if patch == nil {
		return from
	}

	mergedKeys := map[string]bool{}

	merged := from.Transform(func(key string, currValue any) (string, any) {
		mergedKeys[key] = true

		if patchValue, ok := patch[key]; ok {
			if m, ok := patchValue.(objx.Map); ok {
				patchValue = map[string]any(m)
			}

			switch p := patchValue.(type) {
			case map[string]any:
				switch x := currValue.(type) {
				case objx.Map:
					return key, DeepMerge(x, p)
				case map[string]any:
					return key, DeepMerge(x, p)
				}
			}

			// don't merge nil value
			if patchValue != nil {
				return key, patchValue
			}
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

func DecodeTo(from any, to any) error {
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
