package manifest

import (
	"bytes"
	"encoding/json"
	"k8s.io/apimachinery/pkg/api/meta"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type Object = client.Object
type ObjectList = client.ObjectList

func ObjectFromRuntimeObject(ro runtime.Object) (Object, error) {
	o, err := meta.Accessor(ro)
	if err != nil {
		return nil, err
	}
	return o.(Object), nil
}

func ObjectListFromRuntimeObject(ro runtime.Object) (ObjectList, error) {
	o, err := meta.ListAccessor(ro)
	if err != nil {
		return nil, err
	}
	return o.(ObjectList), nil
}

func FromUnstructured[T any](o any) (*T, error) {
	if s, ok := o.(*T); ok {
		return s, nil
	}

	target := new(T)
	if u, ok := o.(*unstructured.Unstructured); ok {
		if err := runtime.DefaultUnstructuredConverter.FromUnstructured(u.Object, target); err != nil {
			return nil, err
		}
		return target, nil
	}

	buf := bytes.NewBuffer(nil)
	if err := json.NewEncoder(buf).Encode(o); err != nil {
		return nil, err
	}
	if err := json.NewDecoder(buf).Decode(target); err != nil {
		return nil, err
	}
	return target, nil
}
