package agent

import (
	"context"
	"fmt"
	"io"
	"net/http"

	"github.com/octohelm/courier/pkg/courierhttp"
	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/octohelm/kubepkg/internal/agent"
	"github.com/octohelm/kubepkg/pkg/ioutil"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	"github.com/octohelm/kubepkg/pkg/kubepkg/mime"
	"github.com/pkg/errors"

	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
)

func AgentInfo(ctx context.Context) (*agent.AgentInfo, error) {
	stat := &StatBlob{
		Digest: "",
	}
	_, meta, _ := stat.Invoke(ctx)
	return agent.FromKubeAgentHead(meta.Get(agent.HEADER_KUBEPKG_AGENT))
}

func ImportKubePkg(ctx context.Context, kubePkgs ...*v1alpha1.KubePkg) error {
	for i := range kubePkgs {
		kubePkg := kubePkgs[i]
		if _, err := (&ApplyKubePkg{ApisKubepkgV1Alpha1KubePkg: kubePkg}).Invoke(ctx); err != nil {
			return err
		}
	}
	return nil
}

func ImportKubePkgTgz(ctx context.Context, tgz io.ReadCloser, incremental bool, skipBlobs bool) error {
	if !incremental {
		apply := &ApplyKubePkg{ReadCloser: courierhttp.WrapReadCloser(tgz)}
		_, err := apply.Invoke(ctx)
		return err
	}

	ai, err := AgentInfo(ctx)
	if err != nil {
		return err
	}

	defer tgz.Close()

	kpkgs, err := kubepkg.KubeTgzRange(ctx, tgz, func(ctx context.Context, dm *v1alpha1.DigestMeta, br io.Reader, i, total int) error {
		if skipBlobs {
			return nil
		}
		if dm.Platform != "" && !sliceContains(ai.SupportedPlatforms, dm.Platform) {
			return nil
		}

		stat := &StatBlob{
			Digest: dm.Digest,
		}

		exists := true
		if _, _, err := stat.Invoke(ctx); err != nil {
			if statuserror.FromErr(err).StatusCode() != http.StatusNotFound {
				return errors.Wrapf(err, "import %s failed", dm)
			}
			exists = false
		}

		if exists {
			return nil
		}

		p := ioutil.NewProgressWriter(ctx, fmt.Sprintf("importing (%d/%d) %s", i, total, dm.Digest), int64(dm.Size))
		p.Start()
		defer p.Stop()

		upload := &UploadBlob{
			ContentType: mime.ToContentType(dm),
			ReadCloser:  io.NopCloser(io.TeeReader(br, p)),
		}
		if _, err := upload.Invoke(ctx); err != nil {
			return errors.Wrapf(err, "import failed： %v", dm)
		}
		return nil
	})
	if err != nil {
		return err
	}

	return ImportKubePkg(ctx, kpkgs...)
}

func sliceContains[T comparable](list []T, target T) bool {
	for i := range list {
		if list[i] == target {
			return true
		}
	}
	return false
}
