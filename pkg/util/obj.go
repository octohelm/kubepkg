package util

import (
	"github.com/stretchr/objx"
)

func Diff[X any](left *X, right *X) (map[string]any, error) {
	var leftObj objx.Map
	if err := DecodeTo(left, &leftObj); err != nil {
		return nil, err
	}

	var rightObj objx.Map
	if err := DecodeTo(right, &rightObj); err != nil {
		return nil, err
	}
	return DiffObj(leftObj, rightObj), nil
}

func equal(left any, right any) bool {
	switch leftValue := left.(type) {
	case []any:
		if rightValue, ok := right.([]any); ok {
			if len(leftValue) != len(rightValue) {
				return false
			}

			for i := range leftValue {
				if !equal(leftValue[i], rightValue[i]) {
					return false
				}
			}

			return true
		}

		return false
	case map[string]any:
		if rightValue, ok := left.(map[string]any); ok {
			if len(leftValue) != len(rightValue) {
				return false
			}

			for k := range leftValue {
				if !equal(leftValue[k], rightValue[k]) {
					return false
				}
			}

			return true
		}

		return false
	}

	return left == right
}

func DiffObj(left objx.Map, right objx.Map) map[string]any {
	if right == nil {
		return nil
	}

	visited := map[string]bool{}
	diffed := map[string]any{}

	for key := range left {
		visited[key] = true

		leftValue := left[key]

		if rightValue, ok := right[key]; ok {
			if m, ok := rightValue.(objx.Map); ok {
				rightValue = map[string]any(m)
			}

			if rightObj, ok := rightValue.(map[string]any); ok {
				switch leftObj := leftValue.(type) {
				case objx.Map:
					if ret := DiffObj(leftObj, rightObj); ret != nil {
						diffed[key] = ret
					}
					continue
				case map[string]any:
					if ret := DiffObj(leftObj, rightObj); ret != nil {
						diffed[key] = ret
					}
					continue
				}
			}

			if !equal(rightValue, leftValue) {
				diffed[key] = rightValue
			}
		}
	}

	// add
	for key := range right {
		if _, ok := visited[key]; !ok {
			diffed[key] = right[key]
		}
	}

	if len(diffed) == 0 {
		return nil
	}

	return diffed
}

func Merge[X any](from *X, overwrites *X) (*X, error) {
	var srcObj objx.Map
	if err := DecodeTo(from, &srcObj); err != nil {
		return nil, err
	}
	var overwritesObj objx.Map
	if err := DecodeTo(overwrites, &overwritesObj); err != nil {
		return nil, err
	}

	merged := MergeObj(srcObj, overwritesObj)
	m := new(X)
	if err := DecodeTo(merged, m); err != nil {
		return nil, err
	}
	return m, nil
}

func MergeObj(from objx.Map, patch objx.Map) objx.Map {
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
					return key, MergeObj(x, p)
				case map[string]any:
					return key, MergeObj(x, p)
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
