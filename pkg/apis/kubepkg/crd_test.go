package kubepkg

import (
	"fmt"
	"testing"

	"sigs.k8s.io/yaml"
)

func TestCustomResourceDefinition(t *testing.T) {
	data, _ := yaml.Marshal(CRDs)
	fmt.Println(string(data))
}
