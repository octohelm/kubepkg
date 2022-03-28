package kubepkg

import (
	"os"

	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"sigs.k8s.io/yaml"
)

func Load(path string) (*v1alpha1.KubePkg, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	kpkg := &v1alpha1.KubePkg{}

	if err := yaml.Unmarshal(data, kpkg); err != nil {
		return nil, err
	}

	return kpkg, nil
}
