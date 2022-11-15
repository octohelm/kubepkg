package v1alpha1

import (
	"fmt"

	"k8s.io/apimachinery/pkg/runtime/schema"
)

type Status struct {
	Endpoint  map[string]string `json:"endpoint,omitempty"`
	Resources []map[string]any  `json:"resources,omitempty"`
	Images    map[string]string `json:"images,omitempty"`
	Digests   []DigestMeta      `json:"digests,omitempty"`
}

func (v *Status) AppendResourceStatus(name string, gvk schema.GroupVersionKind, status map[string]any) {
	apiVersion, kind := gvk.ToAPIVersionAndKind()

	v.Resources = append(v.Resources, map[string]any{
		"apiVersion": apiVersion,
		"kind":       kind,
		"metadata": map[string]any{
			"name": name,
		},
		"status": status,
	})
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
