package proxy

import (
	"context"

	"github.com/distribution/distribution/v3/registry/storage"

	"github.com/distribution/distribution/v3"
	dcontext "github.com/distribution/distribution/v3/context"
	"github.com/distribution/distribution/v3/reference"
	"github.com/opencontainers/go-digest"
)

type proxyManifestStore struct {
	repositoryName  reference.Named
	localManifests  distribution.ManifestService
	remoteManifests distribution.ManifestService
	authChallenger  authChallenger
}

var _ distribution.ManifestService = &proxyManifestStore{}

func (pms proxyManifestStore) Exists(ctx context.Context, dgst digest.Digest) (bool, error) {
	exists, err := pms.localManifests.Exists(ctx, dgst)
	if err != nil {
		return false, err
	}
	if exists {
		return true, nil
	}
	if err := pms.authChallenger.tryEstablishChallenges(ctx); err != nil {
		return false, err
	}
	return pms.remoteManifests.Exists(ctx, dgst)
}

func (pms proxyManifestStore) Get(ctx context.Context, dgst digest.Digest, options ...distribution.ManifestServiceOption) (distribution.Manifest, error) {
	manifest, err := pms.localManifests.Get(ctx, dgst, options...)
	if err != nil {
		if err := pms.authChallenger.tryEstablishChallenges(ctx); err != nil {
			return nil, err
		}

		manifest, err = pms.remoteManifests.Get(ctx, dgst, options...)
		if err != nil {
			return nil, err
		}
		// store local
		go func() {
			if _, err := pms.localManifests.Put(ctx, manifest, storage.SkipLayerVerification()); err != nil {
				dcontext.GetLogger(ctx).Errorf("store manifest to local failed: %s", err)
			}
		}()
	}

	return manifest, err
}

func (pms proxyManifestStore) Put(ctx context.Context, manifest distribution.Manifest, options ...distribution.ManifestServiceOption) (digest.Digest, error) {
	return pms.localManifests.Put(ctx, manifest, options...)
}

func (pms proxyManifestStore) Delete(ctx context.Context, dgst digest.Digest) error {
	return pms.localManifests.Delete(ctx, dgst)
}
