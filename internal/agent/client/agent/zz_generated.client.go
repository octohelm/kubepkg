/*
Package agent GENERATED BY gengo:client
DON'T EDIT THIS FILE
*/
package agent

import (
	context "context"
	io "io"

	github_com_octohelm_courier_pkg_courier "github.com/octohelm/courier/pkg/courier"
	github_com_octohelm_courier_pkg_courierhttp "github.com/octohelm/courier/pkg/courierhttp"
	github_com_octohelm_kubepkg_pkg_apis_kubepkg_v1alpha1 "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
)

type UploadBlob struct {
	github_com_octohelm_courier_pkg_courierhttp.MethodPut `path:"/api/kubepkg-agent/v1/blobs"`

	ContentType string `name:"Content-Type" in:"header"`

	io.ReadCloser `in:"body" mime:"octet-stream"`
}

func (r *UploadBlob) Do(ctx context.Context, metas ...github_com_octohelm_courier_pkg_courier.Metadata) github_com_octohelm_courier_pkg_courier.Result {
	return github_com_octohelm_courier_pkg_courier.ClientFromContent(ctx, "agent").Do(ctx, r, metas...)
}

func (r *UploadBlob) Invoke(ctx context.Context, metas ...github_com_octohelm_courier_pkg_courier.Metadata) (github_com_octohelm_courier_pkg_courier.Metadata, error) {
	return r.Do(ctx, metas...).Into(nil)
}

type StatBlobResponse = GithubComDistributionDistributionV3Descriptor

type StatBlob struct {
	github_com_octohelm_courier_pkg_courierhttp.MethodGet `path:"/api/kubepkg-agent/v1/blobs/:digest/stat"`

	Digest string `name:"digest" in:"path"`
}

func (r *StatBlob) Do(ctx context.Context, metas ...github_com_octohelm_courier_pkg_courier.Metadata) github_com_octohelm_courier_pkg_courier.Result {
	return github_com_octohelm_courier_pkg_courier.ClientFromContent(ctx, "agent").Do(ctx, r, metas...)
}

func (r *StatBlob) Invoke(ctx context.Context, metas ...github_com_octohelm_courier_pkg_courier.Metadata) (*StatBlobResponse, github_com_octohelm_courier_pkg_courier.Metadata, error) {
	var resp StatBlobResponse
	meta, err := r.Do(ctx, metas...).Into(&resp)
	return &resp, meta, err
}

type ListKubePkgResponse = []ApisKubepkgV1Alpha1KubePkg

type ListKubePkg struct {
	github_com_octohelm_courier_pkg_courierhttp.MethodGet `path:"/api/kubepkg-agent/v1/kubepkgs"`

	Namespace string `name:"namespace,omitempty" in:"query"`
}

func (r *ListKubePkg) Do(ctx context.Context, metas ...github_com_octohelm_courier_pkg_courier.Metadata) github_com_octohelm_courier_pkg_courier.Result {
	return github_com_octohelm_courier_pkg_courier.ClientFromContent(ctx, "agent").Do(ctx, r, metas...)
}

func (r *ListKubePkg) Invoke(ctx context.Context, metas ...github_com_octohelm_courier_pkg_courier.Metadata) (*ListKubePkgResponse, github_com_octohelm_courier_pkg_courier.Metadata, error) {
	var resp ListKubePkgResponse
	meta, err := r.Do(ctx, metas...).Into(&resp)
	return &resp, meta, err
}

type ApplyKubePkg struct {
	github_com_octohelm_courier_pkg_courierhttp.MethodPut `path:"/api/kubepkg-agent/v1/kubepkgs"`

	*ApisKubepkgV1Alpha1KubePkg `in:"body" mime:"json,strict"`
	io.ReadCloser               `in:"body" mime:"octet-stream,strict"`
}

func (r *ApplyKubePkg) Do(ctx context.Context, metas ...github_com_octohelm_courier_pkg_courier.Metadata) github_com_octohelm_courier_pkg_courier.Result {
	return github_com_octohelm_courier_pkg_courier.ClientFromContent(ctx, "agent").Do(ctx, r, metas...)
}

func (r *ApplyKubePkg) Invoke(ctx context.Context, metas ...github_com_octohelm_courier_pkg_courier.Metadata) (github_com_octohelm_courier_pkg_courier.Metadata, error) {
	return r.Do(ctx, metas...).Into(nil)
}

type GetKubePkgResponse = ApisKubepkgV1Alpha1KubePkg

type GetKubePkg struct {
	github_com_octohelm_courier_pkg_courierhttp.MethodGet `path:"/api/kubepkg-agent/v1/kubepkgs/:name"`

	Name string `name:"name" in:"path"`

	Namespace string `name:"namespace,omitempty" in:"query"`
}

func (r *GetKubePkg) Do(ctx context.Context, metas ...github_com_octohelm_courier_pkg_courier.Metadata) github_com_octohelm_courier_pkg_courier.Result {
	return github_com_octohelm_courier_pkg_courier.ClientFromContent(ctx, "agent").Do(ctx, r, metas...)
}

func (r *GetKubePkg) Invoke(ctx context.Context, metas ...github_com_octohelm_courier_pkg_courier.Metadata) (*GetKubePkgResponse, github_com_octohelm_courier_pkg_courier.Metadata, error) {
	var resp GetKubePkgResponse
	meta, err := r.Do(ctx, metas...).Into(&resp)
	return &resp, meta, err
}

type DelKubePkg struct {
	github_com_octohelm_courier_pkg_courierhttp.MethodDelete `path:"/api/kubepkg-agent/v1/kubepkgs/:name"`

	Name string `name:"name" in:"path"`

	Namespace string `name:"namespace,omitempty" in:"query"`
}

func (r *DelKubePkg) Do(ctx context.Context, metas ...github_com_octohelm_courier_pkg_courier.Metadata) github_com_octohelm_courier_pkg_courier.Result {
	return github_com_octohelm_courier_pkg_courier.ClientFromContent(ctx, "agent").Do(ctx, r, metas...)
}

func (r *DelKubePkg) Invoke(ctx context.Context, metas ...github_com_octohelm_courier_pkg_courier.Metadata) (github_com_octohelm_courier_pkg_courier.Metadata, error) {
	return r.Do(ctx, metas...).Into(nil)
}

type GithubComDistributionDistributionV3Descriptor struct {
	Annotations map[string]string `json:"annotations,omitempty" name:"annotations,omitempty" `

	Digest GithubComOpencontainersGoDigestDigest `json:"digest,omitempty" name:"digest,omitempty" `

	MediaType string `json:"mediaType,omitempty" name:"mediaType,omitempty" `

	Platform GithubComOpencontainersImageSpecSpecsGoV1Platform `json:"platform,omitempty" name:"platform,omitempty" `

	Size int64 `json:"size,omitempty" name:"size,omitempty" `

	Urls []string `json:"urls,omitempty" name:"urls,omitempty" `
}

type ApisKubepkgV1Alpha1KubePkg = github_com_octohelm_kubepkg_pkg_apis_kubepkg_v1alpha1.KubePkg

type GithubComOpencontainersGoDigestDigest string

type GithubComOpencontainersImageSpecSpecsGoV1Platform struct {
	Architecture string `json:"architecture" name:"architecture" `

	Os string `json:"os" name:"os" `

	OsFeatures []string `json:"os.features,omitempty" name:"os.features,omitempty" `

	OsVersion string `json:"os.version,omitempty" name:"os.version,omitempty" `

	Variant string `json:"variant,omitempty" name:"variant,omitempty" `
}
