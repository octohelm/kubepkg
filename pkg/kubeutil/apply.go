package kubeutil

import (
	"encoding/json"
	"fmt"

	"github.com/stretchr/objx"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

func AutoMergePath(gvk schema.GroupVersionKind, live client.Object) client.Patch {
	return &autoMergePath{
		gvk:  gvk,
		live: live,
	}
}

type autoMergePath struct {
	gvk  schema.GroupVersionKind
	live client.Object
}

func (a *autoMergePath) CanMergeStrategic() bool {
	if a.gvk.Group == corev1.GroupName && (a.gvk.Kind == "Service" || a.gvk.Kind == "PersistentVolumeClaim") {
		return false
	}
	if a.gvk.Group == corev1.GroupName || a.gvk.Group == appsv1.GroupName {
		return true
	}
	return false
}

func (a *autoMergePath) Type() types.PatchType {
	if a.CanMergeStrategic() {
		return types.StrategicMergePatchType
	}
	return types.MergePatchType
}

func (a *autoMergePath) Data(obj client.Object) (data []byte, error error) {
	if a.CanMergeStrategic() {
		if _, ok := obj.(*unstructured.Unstructured); ok {
			return client.MergeFromWithOptions(a.live, client.MergeFromWithOptimisticLock{}).Data(obj)
		}
		return client.StrategicMergeFrom(a.live, client.MergeFromWithOptimisticLock{}).Data(obj)
	}

	live, err := a.toUnstructured(a.live)
	if err != nil {
		return nil, err
	}
	merged, err := a.toUnstructured(obj)
	if err != nil {
		return nil, err
	}

	o := objx.Map(merged.Object)
	l := objx.Map(live.Object)

	var delKey = func(next objx.Map, cur objx.Map) {
		// current has but final not
		for k := range cur {
			if _, ok := next[k]; !ok {
				next[k] = nil
			}
		}
	}

	f := l.Merge(o)

	for _, path := range deletableMaps {
		if cur := l.Get(path); cur.IsObjxMap() {
			if next := o.Get(path); next.IsObjxMap() {
				delKey(next.MustObjxMap(), cur.MustObjxMap())
			}
		}
	}

	delete(f, "status")

	merged.Object = f

	defer func() {
		fmt.Println(string(data))
	}()

	return json.Marshal(merged)
}

var deletableMaps = []string{
	"metadata.labels",
	"metadata.annotations",
	"spec.envs",
}

func (a *autoMergePath) toUnstructured(obj client.Object) (*unstructured.Unstructured, error) {
	if u, ok := obj.(*unstructured.Unstructured); ok {
		return u, nil
	}
	data, err := json.Marshal(obj)
	if err != nil {
		return nil, err
	}
	u := &unstructured.Unstructured{}
	if _, _, err := unstructured.UnstructuredJSONScheme.Decode(data, &a.gvk, u); err != nil {
		return nil, err
	}
	return u, nil
}
