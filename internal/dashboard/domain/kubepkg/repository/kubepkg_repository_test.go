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
		created, _, err := repo.Add(ctx, k)
		testingutil.Expect(t, err, testingutil.Be[error](nil))

		t.Run("recreated should return previous version", func(t *testing.T) {
			v := k.DeepCopy()
			v.Spec.Version = "xxxx"

			recreated, _, err := repo.Add(ctx, k)
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, recreated.Spec.Version, testingutil.Be(created.Spec.Version))
		})

		t.Run("list", func(t *testing.T) {
			list, err := repo.ListVersion(ctx, "test", "test", kubepkg.CHANNEL__DEV, nil, nil)
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, len(list) > 0, testingutil.Be(true))
		})

		t.Run("Should delete", func(t *testing.T) {
			var rid kubepkg.RevisionID
			_ = rid.UnmarshalText([]byte(k.Annotations["kubepkg.innoai.tech/revision"]))

			err := repo.DeleteRevision(ctx, rid)
			testingutil.Expect(t, err, testingutil.Be[error](nil))
		})
	})
}

var k = &v1alpha1.KubePkg{}

type Obj = map[string]any
type Array = []any

func init() {
	k.Name = "test"
	k.Namespace = "test"
	k.Spec.Version = "0.0.0"
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
