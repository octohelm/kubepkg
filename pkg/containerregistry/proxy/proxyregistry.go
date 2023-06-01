package proxy

import (
	"context"

	"net/http"
	"net/url"

	"github.com/distribution/distribution/v3"
	"github.com/distribution/distribution/v3/configuration"
	"github.com/distribution/distribution/v3/reference"
	"github.com/distribution/distribution/v3/registry/client"
	"github.com/distribution/distribution/v3/registry/client/transport"
	"github.com/distribution/distribution/v3/registry/storage"
	"github.com/distribution/distribution/v3/registry/storage/driver"
	containerregistryclient "github.com/octohelm/kubepkg/pkg/containerregistry/client"
	"github.com/octohelm/kubepkg/pkg/containerregistry/util"
)

// proxyingRegistry fetches content from a remote registry and caches it locally
type proxyingRegistry struct {
	embedded       distribution.Namespace // provides local registry functionality
	remoteURL      url.URL
	authChallenger containerregistryclient.AuthChallenger
}

func NewProxyFallbackRegistry(ctx context.Context, registry distribution.Namespace, driver driver.StorageDriver, config configuration.Proxy) (distribution.Namespace, error) {
	remoteURL, err := url.Parse(config.RemoteURL)
	if err != nil {
		return nil, err
	}

	authC, err := containerregistryclient.NewAuthChallenger(remoteURL, config.Username, config.Password)
	if err != nil {
		return nil, err
	}

	return &proxyingRegistry{
		embedded:       registry,
		remoteURL:      *remoteURL,
		authChallenger: authC,
	}, nil
}

func (pr *proxyingRegistry) Scope() distribution.Scope {
	return distribution.GlobalScope
}

func (pr *proxyingRegistry) Repositories(ctx context.Context, repos []string, last string) (n int, err error) {
	return pr.embedded.Repositories(ctx, repos, last)
}

func (pr *proxyingRegistry) Repository(ctx context.Context, name reference.Named) (distribution.Repository, error) {
	tr := transport.NewTransport(
		http.DefaultTransport,
		containerregistryclient.NewAuthorizer(ctx, pr.authChallenger, name, []string{"pull"}),
	)

	localRepo, err := pr.embedded.Repository(ctx, name)
	if err != nil {
		return nil, err
	}

	localManifests, err := localRepo.Manifests(ctx, storage.SkipLayerVerification())
	if err != nil {
		return nil, err
	}

	remoteRepo, err := client.NewRepository(name, pr.remoteURL.String(), util.WithLogger()(tr))
	if err != nil {
		return nil, err
	}

	remoteManifests, err := remoteRepo.Manifests(ctx)
	if err != nil {
		return nil, err
	}

	return &proxiedRepository{
		blobStore: &proxyBlobStore{
			localStore:     localRepo.Blobs(ctx),
			remoteStore:    remoteRepo.Blobs(ctx),
			repositoryName: name,
			authChallenger: pr.authChallenger,
		},
		manifests: &proxyManifestStore{
			repositoryName:  name,
			localManifests:  localManifests, // Options?
			remoteManifests: remoteManifests,
			authChallenger:  pr.authChallenger,
		},
		name: name,
		tags: &proxyTagService{
			localTags:      localRepo.Tags(ctx),
			remoteTags:     remoteRepo.Tags(ctx),
			authChallenger: pr.authChallenger,
		},
	}, nil
}

func (pr *proxyingRegistry) Blobs() distribution.BlobEnumerator {
	return pr.embedded.Blobs()
}

func (pr *proxyingRegistry) BlobStatter() distribution.BlobStatter {
	return pr.embedded.BlobStatter()
}

// proxiedRepository uses proxying blob and manifest services to serve content
// locally, or pulling it through from a remote and caching it locally if it doesn't
// already exist
type proxiedRepository struct {
	blobStore distribution.BlobStore
	manifests distribution.ManifestService
	name      reference.Named
	tags      distribution.TagService
}

func (pr *proxiedRepository) Manifests(ctx context.Context, options ...distribution.ManifestServiceOption) (distribution.ManifestService, error) {
	return pr.manifests, nil
}

func (pr *proxiedRepository) Blobs(ctx context.Context) distribution.BlobStore {
	return pr.blobStore
}

func (pr *proxiedRepository) Named() reference.Named {
	return pr.name
}

func (pr *proxiedRepository) Tags(ctx context.Context) distribution.TagService {
	return pr.tags
}
