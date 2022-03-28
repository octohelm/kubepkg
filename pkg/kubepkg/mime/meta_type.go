package mime

import (
	"mime"
	"strconv"

	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/pkg/errors"
)

var MediaTypeKubePkg = "application/vnd.octohelm.kubepkg.v1.tar+gzip"
var MediaTypeKubePkgDigestMeta = "application/vnd.octohelm.kubepkg.digestmeta.v1+json"

func init() {
	_ = mime.AddExtensionType(".kube.tgz", MediaTypeKubePkg)
	_ = mime.AddExtensionType(".kube.digest.json", MediaTypeKubePkgDigestMeta)
}

func FromContentType(ct string) (*v1alpha1.DigestMeta, error) {
	mt, params, err := mime.ParseMediaType(ct)
	if err != nil {
		return nil, err
	}
	if mt != MediaTypeKubePkgDigestMeta {
		return nil, errors.Errorf("invalid media type `%s`", mt)
	}

	dm := &v1alpha1.DigestMeta{}

	if v := params["type"]; v != "" {
		dm.Type = v
	}

	if v := params["name"]; v != "" {
		dm.Name = v
	}

	if v := params["digest"]; v != "" {
		dm.Digest = v
	}

	if v := params["size"]; v != "" {
		size, _ := strconv.Atoi(v)
		dm.Size = v1alpha1.FileSize(size)
	}

	if v := params["tag"]; v != "" {
		dm.Tag = v
	}

	if v := params["platform"]; v != "" {
		dm.Platform = v
	}

	return dm, nil
}

func ToContentType(dm *v1alpha1.DigestMeta) string {
	values := map[string]string{
		"type":   dm.Type,
		"name":   dm.Name,
		"size":   strconv.Itoa(int(dm.Size)),
		"digest": dm.Digest,
	}

	if tag := dm.Tag; tag != "" {
		values["tag"] = tag
	}

	if platform := dm.Platform; platform != "" {
		values["platform"] = platform
	}

	return mime.FormatMediaType(MediaTypeKubePkgDigestMeta, values)
}
