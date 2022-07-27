package repository_test

import (
	"testing"

	"github.com/innoai-tech/infra/pkg/otel"
	"github.com/octohelm/kubepkg/internal/dashboard"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg"
	kubepkgrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg/repository"
	"github.com/octohelm/kubepkg/internal/testingutil"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/idgen"
)

func TestGroupEnvDeploymentRepository(t *testing.T) {
	var d = &struct {
		otel.Otel
		idgen.IDGen
		dashboard.Database
	}{}
	d.LogLevel = "debug"
	d.EnableMigrate = true

	ctx := testingutil.NewContext(t, d)

	krepo := kubepkgrepository.NewKubepkgRepository()

	// create group
	ge := repository.NewGroupEnvRepository(&group.Group{
		ID:   1,
		Name: "test",
	})

	// create group env
	env, err := ge.Put(ctx, "default", group.EnvInfo{
		EnvType: group.ENV_TYPE__DEV,
		Desc:    "test",
	})
	testingutil.Expect(t, err, testingutil.Be[error](nil))

	// create kubepkg
	_, kubepkgRef, err := krepo.Add(ctx, k)
	testingutil.Expect(t, err, testingutil.Be[error](nil))

	repo := repository.NewGroupEnvDeploymentRepository(env)

	t.Run("When added deployment", func(t *testing.T) {
		d, err := repo.BindKubepkg(ctx, "demo", group.KubepkgRel{
			KubepkgChannel: kubepkg.CHANNEL__DEV,
			KubepkgID:      kubepkgRef.KubepkgID,
		})
		testingutil.Expect(t, err, testingutil.Be[error](nil))

		t.Run("Then add setting", func(t *testing.T) {
			settings := map[string]any{
				"A": "1",
			}

			created, err := repo.AddSetting(ctx, d.DeploymentID, settings)
			testingutil.Expect(t, err, testingutil.Be[error](nil))

			t.Run("When recreated same, should return created", func(t *testing.T) {
				recreated, err := repo.AddSetting(ctx, d.DeploymentID, settings)
				testingutil.Expect(t, err, testingutil.Be[error](nil))
				testingutil.Expect(t, recreated.DeploymentSettingID, testingutil.Be(created.DeploymentSettingID))
			})

			t.Run("Should get decode setting", func(t *testing.T) {
				found, err := repo.GetSetting(ctx, d.DeploymentID, created.DeploymentSettingID)
				testingutil.Expect(t, err, testingutil.Be[error](nil))
				testingutil.Expect(t, found, testingutil.Equal(settings))
			})

			t.Run("record deployment", func(t *testing.T) {
				err := repo.RecordDeployment(ctx, created.DeploymentID, kubepkgRef.WithSettingID(uint64(created.DeploymentSettingID)))
				testingutil.Expect(t, err, testingutil.Be[error](nil))

				t.Run("then could be listed", func(t *testing.T) {
					list, err := repo.ListKubePkgHistory(ctx, created.DeploymentID, nil)
					testingutil.Expect(t, err, testingutil.Be[error](nil))
					testingutil.PrintJSON(list)
				})
			})

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
