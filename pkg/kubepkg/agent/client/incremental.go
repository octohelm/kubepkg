package client

import (
	"context"
	"fmt"
	"github.com/octohelm/kubepkg/pkg/ioutil"
	"io"

	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	"github.com/pkg/errors"
)

func IncrementalImport(ctx context.Context, c *Client, tgz io.Reader, skipBlobs bool) (*v1alpha1.KubePkg, error) {
	ai, err := c.AgentInfo(ctx)
	if err != nil {
		return nil, err
	}

	kpkg, err := kubepkg.KubeTgzRange(ctx, tgz, func(ctx context.Context, dm *v1alpha1.DigestMeta, br io.Reader, i, total int) error {
		if skipBlobs {
			return nil
		}
		if dm.Platform != "" && !SliceContains(ai.SupportedPlatforms, dm.Platform) {
			return nil
		}
		exists, err := c.ExistsDigest(ctx, dm)
		if err != nil {
			return errors.Wrapf(err, "import %s failed", dm)
		}
		if exists {
			return nil
		}

		p := ioutil.NewProgressWriter(ctx, fmt.Sprintf("importing (%d/%d) %s", i, total, dm.Digest), int64(dm.Size))
		p.Start()
		defer p.Stop()
		if err := c.ImportDigest(ctx, dm, io.TeeReader(br, p)); err != nil {
			return errors.Wrapf(err, "import %s failed", dm)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return c.ImportKubePkg(ctx, kpkg)
}
