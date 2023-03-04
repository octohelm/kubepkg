package v1alpha1

import (
	"reflect"

	"github.com/octohelm/courier/pkg/openapi/jsonschema/extractors"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func init() {
	SchemeBuilder.Register(&KubePkg{}, &KubePkgList{})
}

// KubePkgList
// +gengo:deepcopy
// +gengo:deepcopy:interfaces=k8s.io/apimachinery/pkg/runtime.Object
type KubePkgList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []KubePkg `json:"items"`
}

// KubePkg
// +gengo:deepcopy
// +gengo:deepcopy:interfaces=k8s.io/apimachinery/pkg/runtime.Object
type KubePkg struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`
	Spec              Spec    `json:"spec"`
	Status            *Status `json:"status,omitempty"`
}

func init() {
	extractors.RegisterFieldFilter(reflect.TypeOf(metav1.ObjectMeta{}), extractors.FieldFilter{
		Include: []string{
			"name",
			"namespace",
			"labels",
			"annotations",
		},
	})

	extractors.RegisterFieldFilter(reflect.TypeOf(corev1.PodSpec{}), extractors.FieldFilter{
		Exclude: []string{
			"containers",
			"volumes",
			"initContainers",
			"ephemeralContainers",
		},
	})
}
