package kubepkg

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"testing"

	"github.com/distribution/distribution/v3/reference"
	"github.com/octohelm/kubepkg/pkg/containerregistry"
	"github.com/octohelm/kubepkg/pkg/ioutil"
	. "github.com/octohelm/kubepkg/pkg/testutil"
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

	kpkg, _ := Load(filepath.Join(projectRoot, "testdata/demo.yaml"))
	kubeTgz := filepath.Join(projectRoot, ".tmp/demo.kube.tgz")

	t.Run("When packing", WithT(func() {
		ctx := context.Background()

		It("Should resolve digests", func() {
			resolved, err := dr.Resolve(ctx, kpkg)
			So(err, ShouldBeNil)

			It("Should create kube.tgz", func() {
				f, _ := ioutil.CreateOrOpen(kubeTgz)
				defer f.Close()

				dgst, e := p.KubeTgzTo(ctx, resolved, f)
				if e != nil {
					fmt.Printf("%+v", e)
				}

				So(e, ShouldBeNil)
				So(dgst, ShouldNotBeEmpty)
			})
		})
	}))

	t.Run("When import", WithT(func() {
		ctx := context.Background()
		f, _ := os.Open(kubeTgz)
		defer f.Close()

		kpkg, err := r.ImportFromKubeTgzReader(ctx, f)
		So(err, ShouldBeNil)

		It("Should find digests in registry storage", func() {
			for i := range kpkg.Status.Digests {
				dm := kpkg.Status.Digests[i]
				d, _ := digest.Parse(dm.Digest)
				named, _ := reference.WithName(dm.Name)

				It(fmt.Sprintf("Should exists %s %s", dm.Type, d), func() {
					_, err := lcr.BlobStatter().Stat(ctx, d)
					So(err, ShouldBeNil)

					if dm.Type == "manifest" {
						repo, _ := lcr.Repository(ctx, named)
						manifests, _ := repo.Manifests(ctx)
						exists, _ := manifests.Exists(ctx, d)
						So(exists, ShouldBeTrue)

						if dm.Platform == "" && dm.Tag != "" {
							It("Should tag the correct digest", func() {
								tagged, _ := repo.Tags(ctx).Get(ctx, dm.Tag)
								So(tagged.Digest, ShouldEqual, d)
							})
						}
					}
				})
			}
		})
	}))
}
