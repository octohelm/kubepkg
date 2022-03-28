package kubepkg

import (
	"context"
	"strings"

	"github.com/containerd/containerd/platforms"
	"github.com/distribution/distribution/v3"
	"github.com/distribution/distribution/v3/manifest/manifestlist"
	"github.com/distribution/distribution/v3/manifest/schema2"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/opencontainers/go-digest"
	v1 "github.com/opencontainers/image-spec/specs-go/v1"
	"k8s.io/utils/strings/slices"
)

func NewDigestResolver(n distribution.Namespace) *DigestResolver {
	return &DigestResolver{Namespace: n}
}

type DigestResolver struct {
	distribution.Namespace
}

func (r *DigestResolver) Resolve(ctx context.Context, pkg *v1alpha1.KubePkg) (*v1alpha1.KubePkg, error) {
	p := pkg.DeepCopy()

	var neededPlatforms []string

	if annotations := pkg.GetAnnotations(); annotations != nil {
		if s, ok := annotations[annotationPlatforms]; ok && s != "" {
			neededPlatforms = strings.Split(s, ",")
		}
	}

	for name := range p.Spec.Images {
		imgCtx := r.parseImageCtx(name, p.Spec.Images[name])
		imgCtx.neededPlatforms = neededPlatforms

		repo, err := r.Repository(ctx, imgCtx)
		if err != nil {
			return nil, err
		}

		d, err := r.resolve(ctx, repo, imgCtx, &p.Status)
		if err != nil {
			return nil, err
		}

		p.Spec.Images[name] = d.Digest.String()
	}

	return p, nil
}

const annotationPlatforms = "octohelm.tech/platforms"

func AnnotationPlatforms(k *v1alpha1.KubePkg, platforms []string) {
	if k.Annotations == nil {
		k.Annotations = map[string]string{}
	}
	k.Annotations[annotationPlatforms] = strings.Join(platforms, ",")
}

func (r *DigestResolver) resolve(ctx context.Context, repo distribution.Repository, imgCtx *imageCtx, status *v1alpha1.KubePkgStatus) (distribution.Descriptor, error) {
	if imgCtx.digest != nil {
		ms, err := repo.Manifests(ctx)
		if err != nil {
			return distribution.Descriptor{}, err
		}
		m, err := ms.Get(ctx, *imgCtx.digest)
		if err != nil {
			return distribution.Descriptor{}, err
		}
		mt, data, err := m.Payload()
		if err != nil {
			return distribution.Descriptor{}, err
		}

		status.Digests = append(status.Digests, imgCtx.toDigestMeta(mt, int64(len(data))))

		switch mt {
		case manifestlist.MediaTypeManifestList:
			for _, sub := range m.References() {
				subImgCtx := imgCtx.withDigest(sub.Digest)

				if p := sub.Platform; p != nil {
					subImgCtx = subImgCtx.withPlatform(p)
				}

				if subImgCtx.isNeededPlatform(subImgCtx.platform) {
					if _, err := r.resolve(ctx, repo, subImgCtx, status); err != nil {
						return distribution.Descriptor{}, err
					}
				}
			}
		case schema2.MediaTypeManifest:
			for _, sub := range m.References() {
				subImgCtx := imgCtx.withDigest(sub.Digest)
				status.Digests = append(status.Digests, subImgCtx.toDigestMeta(sub.MediaType, sub.Size))
			}
		}

		return distribution.Descriptor{
			MediaType: mt,
			Digest:    *imgCtx.digest,
			Size:      int64(len(data)),
		}, nil
	}

	// resolve by tag
	d, err := repo.Tags(ctx).Get(ctx, imgCtx.tag)
	if err != nil {
		return distribution.Descriptor{}, nil
	}

	return r.resolve(ctx, repo, imgCtx.withDigest(d.Digest), status)
}

func (r *DigestResolver) parseImageCtx(name string, mayDigest string) *imageCtx {
	if i := strings.Index(name, "@"); i > -1 {
		d, _ := digest.Parse(name[i+1:])
		return &imageCtx{name: name[0:i], digest: &d}
	}

	part := strings.Split(name, ":")

	var d *digest.Digest

	if mayDigest != "" {
		if dd, err := digest.Parse(mayDigest); err == nil {
			d = &dd
		}
	}

	if len(part) >= 2 {
		return &imageCtx{name: part[0], tag: part[1], digest: d}
	}

	return &imageCtx{name: part[0], tag: "latest", digest: d}
}

type imageCtx struct {
	name            string
	digest          *digest.Digest
	tag             string
	platform        string
	neededPlatforms []string
}

func (i imageCtx) withDigest(d digest.Digest) *imageCtx {
	i.digest = &d
	return &i
}

func (i *imageCtx) isNeededPlatform(p string) bool {
	if len(i.neededPlatforms) == 0 {
		return slices.Contains([]string{"linux/amd64", "linux/arm64"}, p)
	}
	return slices.Contains(i.neededPlatforms, p)
}

func (i *imageCtx) Name() string {
	return i.name
}

func (i *imageCtx) String() string {
	s := strings.Builder{}
	s.WriteString(i.name)

	if i.digest != nil {
		s.WriteString("@")
		s.WriteString(i.digest.String())
	}

	if i.tag != "" {
		s.WriteString(",tag=")
		s.WriteString(i.tag)
	}

	if i.platform != "" {
		s.WriteString(",platform=")
		s.WriteString(i.platform)
	}

	return s.String()
}

func (i imageCtx) toDigestMeta(mediaType string, size int64) v1alpha1.DigestMeta {
	typ := "blob"

	switch mediaType {
	case schema2.MediaTypeManifest, manifestlist.MediaTypeManifestList:
		typ = "manifest"
	}

	return v1alpha1.DigestMeta{
		Type:     typ,
		Digest:   i.digest.String(),
		Size:     v1alpha1.FileSize(size),
		Name:     i.name,
		Tag:      i.tag,
		Platform: i.platform,
	}
}

func (i imageCtx) withPlatform(p *v1.Platform) *imageCtx {
	pp := *p
	if pp.Architecture == "arm64" && pp.Variant == "v8" {
		pp.Variant = ""
	}
	i.platform = platforms.Format(pp)
	return &i
}
