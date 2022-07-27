package v1alpha1

import (
	"fmt"

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

	Items []KubePkg `json:"items"`
}

// KubePkg
// +gengo:deepcopy
// +gengo:deepcopy:interfaces=k8s.io/apimachinery/pkg/runtime.Object
type KubePkg struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`
	Spec              KubePkgSpec   `json:"spec"`
	Status            KubePkgStatus `json:"status,omitempty"`
}

type KubePkgSpec struct {
	Version   string            `json:"version"`
	Images    map[string]string `json:"images,omitempty"`
	Manifests Manifests         `json:"manifests,omitempty"`
}

type Manifests map[string]any

type KubePkgStatus struct {
	Statuses Statuses     `json:"statuses,omitempty"`
	Digests  []DigestMeta `json:"digests,omitempty"`
}

type Statuses map[string]any

// +gengo:enum
type DigestMetaType string

const (
	DigestMetaManifest DigestMetaType = "manifest"
	DigestMetaBlob     DigestMetaType = "blob"
)

type DigestMeta struct {
	Type     DigestMetaType `json:"type"`
	Digest   string         `json:"digest"`
	Name     string         `json:"name"`
	Size     FileSize       `json:"size"`
	Tag      string         `json:"tag,omitempty"`
	Platform string         `json:"platform,omitempty"`
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
