package repository_test

import (
	"testing"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg/repository"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"

	"github.com/innoai-tech/infra/pkg/otel"
	"github.com/octohelm/kubepkg/internal/dashboard"
	"github.com/octohelm/kubepkg/internal/testingutil"
	"github.com/octohelm/kubepkg/pkg/idgen"
)

var d = &struct {
	otel.Otel
	idgen.IDGen
	dashboard.Database
}{}

func init() {
	d.LogLevel = "debug"
	d.EnableMigrate = true
}

func TestKubepkgRepository(t *testing.T) {
	ctx := testingutil.NewContext(t, d)
	repo := repository.NewKubepkgRepository()

	t.Run("When add a kubepkg", func(t *testing.T) {
		created, createdRef, err := repo.Put(ctx, k.DeepCopy())
		testingutil.Expect(t, err, testingutil.Be[error](nil))

		t.Run("for create", func(t *testing.T) {
			testingutil.Expect(t, createdRef.Overwrites == nil, testingutil.Be(true))
		})

		t.Run("recreated without spec changes, should return same", func(t *testing.T) {
			recreated, recreatedRef, err := repo.Put(ctx, k.DeepCopy())
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, recreated, testingutil.Equal(created))

			testingutil.Expect(t, recreated.Kind, testingutil.Equal("KubePkg"))
			testingutil.Expect(t, recreatedRef.Overwrites == nil, testingutil.Be(true))
			testingutil.Expect(t, recreated.GroupVersionKind().GroupVersion(), testingutil.Equal(v1alpha1.SchemeGroupVersion))
		})

		t.Run("recreated should return previous kube template version, and diffed overwrites", func(t *testing.T) {
			modifiedKubepkg := created.DeepCopy()

			modifiedKubepkg.Spec.Version = "v0.1.0"
			modifiedKubepkg.Spec.Config = map[string]v1alpha1.EnvVarValueOrFrom{
				"ENV": {Value: "DEV"},
			}

			recreated, ref, err := repo.Put(ctx, modifiedKubepkg)
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, recreated, testingutil.Equal(created))

			testingutil.Expect(t, ref.Overwrites, testingutil.Equal(map[string]any{
				"spec": map[string]any{
					"version": "v0.1.0",
					"config": map[string]any{
						"ENV": "DEV",
					},
				},
			}))
		})

		t.Run("list", func(t *testing.T) {
			list, err := repo.List(ctx, "test", kubepkg.KubepkgQueryParams{})
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, len(list) > 0, testingutil.Be(true))
		})

		t.Run("list version", func(t *testing.T) {
			list, err := repo.ListVersion(ctx, "test", "test", kubepkg.CHANNEL__DEV, nil, nil)
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, len(list) > 0, testingutil.Be(true))

			_, err2 := repo.Get(ctx, "test", "test", kubepkg.CHANNEL__DEV, list[0].RevisionID)
			testingutil.Expect(t, err2, testingutil.Be[error](nil))
		})

		t.Run("latest versions", func(t *testing.T) {
			latestVersions, err := repo.Latest(ctx, []string{
				"test/test@DEV",
			})
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, len(latestVersions) > 0, testingutil.Be(true))
		})
	})
}

var k = &v1alpha1.KubePkg{}

type Obj = map[string]any
type Array = []any

func init() {
	k.SetGroupVersionKind(v1alpha1.SchemeGroupVersion.WithKind("KubePkg"))
	k.Name = "test"
	k.Namespace = "test"
	k.Spec.Version = "v3.0.0-20230822080114-147d45f4785d"
	k.Spec.Manifests = Obj{
		"web": Obj{
			"apiVersion": "apps/v1",
			"kind":       "Deployment",
			"metadata": Obj{
				"name": "web",
			},
			"spec": Obj{
				"replicas": 1,
				"selector": Obj{
					"matchLabels": Obj{
						"group": "test",
						"app":   "test",
					},
				},
				"template": Obj{
					"metadata": Obj{
						"labels": Obj{
							"group": "test",
							"app":   "test",
						},
					},
					"spec": Obj{
						"containers": Array{
							Obj{
								"name":  "test",
								"image": "docker.io/library/nginx:alpine",
							},
						},
					},
				},
			},
		},
	}
}
