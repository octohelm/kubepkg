package kubeutil

import (
	"k8s.io/apimachinery/pkg/api/meta"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

var FieldOwner = client.FieldOwner("kubepkg")

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

func NewForGroupVersionKind(gvk schema.GroupVersionKind) (Object, error) {
	ro := &unstructured.Unstructured{}
	ro.GetObjectKind().SetGroupVersionKind(gvk)
	return ObjectFromRuntimeObject(ro)
}
