package manifest

import (
	"bytes"
	"fmt"
	"sort"

	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/pkg/errors"
	"github.com/stretchr/objx"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

type ObjectProcess = func(o Object) (Object, error)

func Extract(m any, progress ...ObjectProcess) (map[string]Object, error) {
	w := &walker{
		manifests: map[string]Object{},
		progress:  progress,
	}

	if err := w.walk(m, nil); err != nil {
		return nil, err
	}

	return w.manifests, nil
}

type walker struct {
	manifests map[string]Object
	progress  []ObjectProcess
}

func (w *walker) walk(v any, path path) error {
	switch x := v.(type) {
	case v1alpha1.Manifests:
		return w.walkObj(map[string]any(x), path)
	case map[string]any:
		return w.walkObj(x, path)
	case []any:
		return w.walkList(x, path)
	}
	return errors.Errorf("unsupported %T %s", v, path)
}

func (w *walker) walkObj(obj objx.Map, p path) error {
	if isKubernetesManifest(obj) {
		co, err := ObjectFromRuntimeObject(&unstructured.Unstructured{Object: obj})
		if err != nil {
			return err
		}

		for i := range w.progress {
			co, err = w.progress[i](co)
			if err != nil {
				return err
			}
		}

		w.manifests[p.Full()] = co
		return nil
	}

	keys := make([]string, 0, len(obj))
	for k := range obj {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	for _, key := range keys {
		nextP := append(p, key)
		if obj[key] == nil { // result from false if condition in Jsonnet
			continue
		}
		if err := w.walk(obj[key], nextP); err != nil {
			return err
		}
	}

	return nil
}

func (w *walker) walkList(list []any, p path) error {
	for idx, value := range list {
		err := w.walk(value, append(p, idx))
		if err != nil {
			return err
		}
	}
	return nil
}

func isKubernetesManifest(obj objx.Map) bool {
	return obj.Get("apiVersion").IsStr() &&
		obj.Get("apiVersion").Str() != "" &&
		obj.Get("kind").IsStr() &&
		obj.Get("kind").Str() != ""
}

type path []any

func (p path) Full() string {
	b := bytes.NewBuffer(nil)
	for i, v := range p {
		switch value := v.(type) {
		case string:
			if i == 0 {
				_, _ = fmt.Fprintf(b, "%s", value)
			} else {
				_, _ = fmt.Fprintf(b, ".%s", value)
			}
		case int:
			_, _ = fmt.Fprintf(b, "[%d]", value)
		}
	}
	return b.String()
}

func (p path) Base() string {
	if len(p) > 0 {
		return p[:len(p)-1].Full()
	}
	return "."
}
