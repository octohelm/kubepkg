package kubepkg

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"testing"

	"github.com/distribution/distribution/v3/reference"
	"github.com/octohelm/kubepkg/pkg/containerregistry"

	"github.com/opencontainers/go-digest"

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
		Proxy: &containerregistry.Proxy{
			RemoteURL: os.Getenv("CUSTOM_DOCKER_ENDPOINT"),
			Username:  os.Getenv("CUSTOM_DOCKER_USERNAME"),
			Password:  os.Getenv("CUSTOM_DOCKER_PASSWORD"),
		},
		StorageRoot: filepath.Join(projectRoot, ".tmp/crpe"),
	}

	cr, _ := c.New(context.Background())
	lcr, _ := c.WithoutProxy().New(context.Background())

	dr := NewDigestResolver(cr)
	p := NewPacker(cr)
	r := NewRegistry(lcr, c.MustStorage())

	kpkg, _ := Load(filepath.Join(projectRoot, "testdata/demo.yaml"))

	tgz := filepath.Join(projectRoot, ".tmp/demo.tgz")

	t.Run("packing", func(t *testing.T) {
		ctx := context.Background()

		t.Run("resolve digests", func(t *testing.T) {
			resolved, err := dr.Resolve(ctx, kpkg)
			NewWithT(t).Expect(err).To(BeNil())

			t.Run("to kube.tgz", func(t *testing.T) {
				f, err := os.Create(tgz)
				if os.IsExist(err) {
					f, _ = os.Open(tgz)
				}
				defer f.Close()

				d, err := p.TgzTo(ctx, resolved, f)
				if err != nil {
					fmt.Printf("%+v", err)
				}
				NewWithT(t).Expect(err).To(BeNil())
				fmt.Println(d)
			})
		})
	})

	t.Run("import", func(t *testing.T) {
		f, _ := os.Open(tgz)
		defer f.Close()

		kpkg, err := r.ImportFromReader(context.Background(), f)
		//fmt.Printf("%+v\n", err)
		NewWithT(t).Expect(err).To(BeNil())

		ctx := context.Background()
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
