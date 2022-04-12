package kubepkg

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"testing"

	"github.com/distribution/distribution/v3/reference"
	"github.com/octohelm/kubepkg/pkg/ioutil"
	"github.com/opencontainers/go-digest"

	"github.com/octohelm/kubepkg/pkg/containerregistry"

	. "github.com/onsi/gomega"
)

var projectRoot = resolveProjectRoot()

func resolveProjectRoot() string {
	p, _ := os.Getwd()

	for {
		if p == "/" {
			break
		}

		if _, err := os.Stat(filepath.Join(p, "go.mod")); err == nil {
			return p
		}

		p = filepath.Dir(p)
	}

	return p
}

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

	t.Run("packing", func(t *testing.T) {
		ctx := context.Background()

		t.Run("resolve digests", func(t *testing.T) {
			resolved, err := dr.Resolve(ctx, kpkg)
			NewWithT(t).Expect(err).To(BeNil())

			t.Run("to kube.tgz", func(t *testing.T) {
				f, _ := ioutil.CreateOrOpen(kubeTgz)
				defer f.Close()

				d, e := p.KubeTgzTo(ctx, resolved, f)
				if e != nil {
					fmt.Printf("%+v", e)
				}

				NewWithT(t).Expect(e).To(BeNil())
				fmt.Println(d)
			})
		})
	})

	t.Run("import", func(t *testing.T) {
		ctx := context.Background()

		f, _ := os.Open(kubeTgz)
		defer f.Close()

		kpkg, err := r.ImportFromKubeTgzReader(ctx, f)
		fmt.Printf("%+v\n", err)
		NewWithT(t).Expect(err).To(BeNil())

		for i := range kpkg.Status.Digests {
			dm := kpkg.Status.Digests[i]
			d, _ := digest.Parse(dm.Digest)
			named, _ := reference.WithName(dm.Name)

			t.Run(fmt.Sprintf("exists %s %s", dm.Type, d), func(t *testing.T) {
				_, err := lcr.BlobStatter().Stat(ctx, d)
				NewWithT(t).Expect(err).To(BeNil())

				if dm.Type == "manifest" {
					repo, _ := lcr.Repository(ctx, named)
					manifests, _ := repo.Manifests(ctx)
					exists, _ := manifests.Exists(ctx, d)
					NewWithT(t).Expect(exists).To(BeTrue())

					if dm.Platform == "" && dm.Tag != "" {
						t.Run("tag matched", func(t *testing.T) {
							tagged, _ := repo.Tags(ctx).Get(ctx, dm.Tag)
							NewWithT(t).Expect(tagged.Digest).To(Equal(d))
						})
					}
				}
			})
		}
	})
}
