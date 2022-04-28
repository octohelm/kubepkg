package v1alpha1

import (
	"fmt"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func init() {
	SchemeBuilder.Register(&KubePkg{}, &KubePkgList{})
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object
type KubePkgList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`

	Items []KubePkg `json:"items"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object
type KubePkg struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   KubePkgSpec   `json:"spec,omitempty"`
	Status KubePkgStatus `json:"status,omitempty"`
}

type KubePkgSpec struct {
	Version   string            `json:"version"`
	Images    map[string]string `json:"images,omitempty"`
	Manifests Manifests         `json:"manifests,omitempty"`
}

type Manifests map[string]any

func (s Manifests) DeepCopy() Manifests {
	m := make(Manifests)
	for k := range s {
		m[k] = s[k]
	}
	return m
}

type KubePkgStatus struct {
	Statuses Statuses     `json:"statuses,omitempty"`
	Digests  []DigestMeta `json:"digests,omitempty"`
}

type DigestMeta struct {
	Type     string   `json:"type"`
	Digest   string   `json:"digest"`
	Name     string   `json:"name"`
	Size     FileSize `json:"size"`
	Tag      string   `json:"tag,omitempty"`
	Platform string   `json:"platform,omitempty"`
}

type FileSize int64

func (f FileSize) String() string {
	b := int64(f)
	const unit = 1024
	if b < unit {
		return fmt.Sprintf("%d B", b)
	}
	div, exp := int64(unit), 0
	for n := b / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %ciB", float64(b)/float64(div), "KMGTPE"[exp])
}

type Statuses map[string]any

func (ss Statuses) DeepCopy() Statuses {
	m := make(Statuses)
	for k := range ss {
		m[k] = ss[k]
	}
	return m
}
