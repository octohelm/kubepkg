package kubepkg

import (
	"fmt"
	"os"

	"github.com/pkg/errors"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"

	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"sigs.k8s.io/yaml"
)

func Load(path string) ([]*v1alpha1.KubePkg, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return LoadKubePkgs(data)
}

func LoadKubePkgs(data []byte) ([]*v1alpha1.KubePkg, error) {
	o := &unstructured.Unstructured{}
	if err := yaml.Unmarshal(data, o); err != nil {
		return nil, err
	}

	switch kind := o.GetObjectKind().GroupVersionKind().Kind; kind {
	case "KubePkg":
		kpkg := &v1alpha1.KubePkg{}
		if err := yaml.Unmarshal(data, kpkg); err != nil {
			return nil, err
		}
		if kpkg.Name == "" {
			return nil, fmt.Errorf("invalid spec")
		}
		return []*v1alpha1.KubePkg{kpkg}, nil
	case "KubePkgList":
		kpkgList := &v1alpha1.KubePkgList{}
		if err := yaml.Unmarshal(data, kpkgList); err != nil {
			return nil, err
		}

		list := make([]*v1alpha1.KubePkg, len(kpkgList.Items))
		for i := range kpkgList.Items {
			list[i] = &kpkgList.Items[i]
			if list[i].Name == "" {
				return nil, fmt.Errorf("invalid spec")
			}
		}
		return list, nil
	default:
		return nil, errors.Errorf("unsupported spec %s", kind)
	}
}
