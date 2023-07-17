package kubepkg

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"testing"

	"github.com/distribution/distribution/v3/reference"
	. "github.com/octohelm/kubepkg/internal/testingutil"
	"github.com/octohelm/kubepkg/pkg/containerregistry"
	"github.com/octohelm/kubepkg/pkg/ioutil"
	"github.com/opencontainers/go-digest"
)

var projectRoot = ProjectRoot()

func TestKubePkg(t *testing.T) {
	c := containerregistry.Configuration{
		StorageRoot: filepath.Join(projectRoot, ".tmp/kubepkg"),
		Proxy: &containerregistry.Proxy{
			RemoteURL: os.Getenv("KUBEPKG_REMOTE_REGISTRY_ENDPOINT"),
			Username:  os.Getenv("KUBEPKG_REMOTE_REGISTRY_USERNAME"),
			Password:  os.Getenv("KUBEPKG_REMOTE_REGISTRY_PASSWORD"),
		},
	}

	cr, _ := c.New(context.Background())
	lcr, _ := c.WithoutProxy().New(context.Background())

	dr := NewDigestResolver(cr)
	p := NewPacker(cr)
	r := NewRegistry(lcr, c.MustStorage())

	kpkgs, _ := Load(filepath.Join(projectRoot, "testdata/demo.yaml"))
	kubeTgz := filepath.Join(projectRoot, ".tmp/demo.kube.tgz")
	kpkg := kpkgs[0]

	t.Run("When packing", func(t *testing.T) {
		ctx := context.Background()

		t.Run("Should resolve digests", func(t *testing.T) {
			resolved, err := dr.Resolve(ctx, kpkg)
			Expect(t, err, Be[error](nil))

			t.Run("Should create kube.tgz", func(t *testing.T) {
				f, _ := ioutil.CreateOrOpen(kubeTgz)
				defer f.Close()

				dgst, e := p.KubeTarTo(ctx, f, resolved)
				if e != nil {
					fmt.Printf("%+v", e)
				}

				Expect(t, err, Be[error](nil))
				Expect(t, dgst.String(), NotBe(""))
			})
		})
	})

	t.Run("When import", func(t *testing.T) {
		ctx := context.Background()
		f, _ := os.Open(kubeTgz)
		defer f.Close()

		kpkgs, err := r.ImportFromKubeTgzReader(ctx, f)
		Expect(t, err, Be[error](nil))

		t.Run("Should find digests in registry storage", func(t *testing.T) {
			kpkg := kpkgs[0]

			for i := range kpkg.Status.Digests {
				dm := kpkg.Status.Digests[i]
				d, _ := digest.Parse(dm.Digest)
				named, _ := reference.WithName(dm.Name)

				t.Run(fmt.Sprintf("Should exists %s %s", dm.Type, d), func(t *testing.T) {
					_, err := lcr.BlobStatter().Stat(ctx, d)
					Expect(t, err, Be[error](nil))

					if dm.Type == "manifest" {
						repo, _ := lcr.Repository(ctx, named)
						manifests, _ := repo.Manifests(ctx)
						exists, _ := manifests.Exists(ctx, d)
						Expect(t, exists, Be(true))

						if dm.Platform == "" && dm.Tag != "" {
							t.Run("Should tag the correct digest", func(t *testing.T) {
								tagged, _ := repo.Tags(ctx).Get(ctx, dm.Tag)
								Expect(t, tagged.Digest, Equal(d))
							})
						}
					}
				})
			}
		})
	})
}
