package v1alpha1

import "fmt"

type Status struct {
	Images   map[string]string `json:"images,omitempty"`
	Digests  []DigestMeta      `json:"digests,omitempty"`
	Statuses Statuses          `json:"statuses,omitempty"`
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
