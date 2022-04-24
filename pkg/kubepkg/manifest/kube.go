package manifest

import (
	"k8s.io/apimachinery/pkg/api/meta"
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
