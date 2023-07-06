package kubepkg

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/octohelm/kubepkg/pkg/kubepkg/manifest"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"

	"github.com/containerd/containerd/platforms"
	"github.com/containerd/containerd/reference/docker"
	"github.com/distribution/distribution/v3"
	"github.com/distribution/distribution/v3/manifest/manifestlist"
	"github.com/distribution/distribution/v3/manifest/schema2"
	"github.com/octohelm/kubepkg/pkg/annotation"
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

func (r *DigestResolver) collectImages(images map[string]string, pkg *v1alpha1.KubePkg) error {
	manifests, err := manifest.Extract(pkg)
	if err != nil {
		return err
	}

	fromContainers := func(containers []corev1.Container) {
		for _, c := range containers {
			parts := strings.Split(c.Image, "@")
			d := ""
			if resolved, ok := images[parts[0]]; ok {
				d = resolved
			}
			if len(parts) > 1 {
				d = parts[1]
			}
			images[parts[0]] = d
		}
	}

	for _, o := range manifests {
		switch x := o.(type) {
		case *v1alpha1.KubePkg:
			if err := r.collectImages(images, x); err != nil {
				return err
			}
		case *appsv1.Deployment:
			fromContainers(x.Spec.Template.Spec.Containers)
		case *appsv1.DaemonSet:
			fromContainers(x.Spec.Template.Spec.Containers)
		case *appsv1.StatefulSet:
			fromContainers(x.Spec.Template.Spec.Containers)
		}
	}

	return nil
}

func (r *DigestResolver) Resolve(ctx context.Context, pkg *v1alpha1.KubePkg) (*v1alpha1.KubePkg, error) {
	p := pkg.DeepCopy()

	if p.Status == nil {
		p.Status = &v1alpha1.Status{}
	}

	images := p.Status.Images
	if images == nil {
		images = map[string]string{}
	}
	if err := r.collectImages(images, pkg); err != nil {
		return nil, err
	}
	p.Status.Images = images

	var neededPlatforms []string

	if annotations := pkg.GetAnnotations(); annotations != nil {
		if s, ok := annotations[annotation.Platforms]; ok && s != "" {
			neededPlatforms = strings.Split(s, ",")
		}
	}

	for name := range p.Status.Images {
		imgCtx, err := parseImageCtx(name)
		if err != nil {
			return nil, err
		}

		if mayDigest := p.Status.Images[name]; mayDigest != "" {
			d, err := digest.Parse(mayDigest)
			if err == nil {
				imgCtx.digest = &d
			}
		}

		imgCtx.neededPlatforms = neededPlatforms

		repo, err := r.Repository(ctx, imgCtx)
		if err != nil {
			return nil, err
		}

		d, err := r.resolve(ctx, repo, imgCtx, p.Status)
		if err != nil {
			return nil, err
		}

		if p.Status.Images != nil {
			p.Status.Images[name] = d.Digest.String()
		}
	}

	return p, nil
}

func AnnotationPlatforms(k *v1alpha1.KubePkg, platforms []string) {
	if k.Annotations == nil {
		k.Annotations = map[string]string{}
	}
	k.Annotations[annotation.Platforms] = strings.Join(platforms, ",")
}

func (r *DigestResolver) resolve(ctx context.Context, repo distribution.Repository, imgCtx *imageCtx, status *v1alpha1.Status) (distribution.Descriptor, error) {
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
			dm := m.(*schema2.DeserializedManifest)

			// Read platform from config
			data, _ := repo.Blobs(ctx).Get(ctx, dm.Config.Digest)
			p := &v1.Platform{}
			_ = json.Unmarshal(data, p)
			if p.OS != "" {
				imgCtx = imgCtx.withPlatform(p)
			}

			for _, sub := range dm.References() {
				subImgCtx := imgCtx.withDigest(sub.Digest)
				status.Digests = append(status.Digests, subImgCtx.toDigestMeta(sub.MediaType, sub.Size))
			}
		}

		status.Digests = append(status.Digests, imgCtx.toDigestMeta(mt, int64(len(data))))

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

func parseImageCtx(ref string) (*imageCtx, error) {
	named, err := docker.ParseDockerRef(ref)
	if err != nil {
		return nil, err
	}

	c := &imageCtx{
		name: named.Name(),
		tag:  "latest",
	}

	if digested, ok := named.(docker.Digested); ok {
		d := digested.Digest()
		c.digest = &d
	}

	if tagged, ok := named.(docker.Tagged); ok {
		c.tag = tagged.Tag()
	}

	if i := strings.Index(ref, "@"); i != -1 {
		namedWithoutDigest, err := docker.ParseDockerRef(ref[0:i])
		if err != nil {
			return nil, err
		}
		if tagged, ok := namedWithoutDigest.(docker.Tagged); ok {
			c.tag = tagged.Tag()
		}
	}

	return c, nil
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
	typ := v1alpha1.DigestMetaBlob

	switch mediaType {
	case schema2.MediaTypeManifest, manifestlist.MediaTypeManifestList:
		typ = v1alpha1.DigestMetaManifest
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
