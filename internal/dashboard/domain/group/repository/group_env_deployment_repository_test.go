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

	repo := repository.NewGroupEnvDeploymentRepository(&env.Env)

	t.Run("When added deployment", func(t *testing.T) {
		d, err := repo.BindKubepkg(ctx, "demo", group.KubepkgRel{
			KubepkgChannel: kubepkg.CHANNEL__DEV,
			KubepkgID:      kubepkgRef.KubepkgID,
		})

		testingutil.Expect(t, err, testingutil.Be[error](nil))

		t.Run("Then add setting", func(t *testing.T) {
			settings := map[string]string{
				"A": "1",
			}

			created, err := repo.RecordSetting(ctx, d.DeploymentID, settings)
			testingutil.Expect(t, err, testingutil.Be[error](nil))

			t.Run("When recreated same, should return created", func(t *testing.T) {
				recreated, err := repo.RecordSetting(ctx, d.DeploymentID, settings)
				testingutil.Expect(t, err, testingutil.Be[error](nil))
				testingutil.Expect(t, recreated.DeploymentSettingID, testingutil.Be(created.DeploymentSettingID))
			})

			t.Run("Should get decode setting", func(t *testing.T) {
				found, err := repo.GetSetting(ctx, d.DeploymentID, created.DeploymentSettingID)
				testingutil.Expect(t, err, testingutil.Be[error](nil))
				testingutil.Expect(t, found, testingutil.Equal(settings))
			})

			t.Run("record deployment", func(t *testing.T) {
				_, err := repo.RecordDeployment(ctx, created.DeploymentID, kubepkgRef.WithSettingID(uint64(created.DeploymentSettingID)))
				testingutil.Expect(t, err, testingutil.Be[error](nil))

				t.Run("then could be list", func(t *testing.T) {
					list, err := repo.ListKubepkg(ctx, nil)
					testingutil.Expect(t, err, testingutil.Be[error](nil))
					testingutil.Expect(t, len(list.Data), testingutil.Be(1))

					t.Run("update settings", func(t *testing.T) {
						newSettings := map[string]string{
							"A": "2",
						}

						settingV2, err := repo.RecordSetting(ctx, d.DeploymentID, newSettings)
						testingutil.Expect(t, err, testingutil.Be[error](nil))

						_, err = repo.RecordDeployment(ctx, settingV2.DeploymentID, kubepkgRef.WithSettingID(uint64(settingV2.DeploymentSettingID)))
						testingutil.Expect(t, err, testingutil.Be[error](nil))

						listV2, err := repo.ListKubepkg(ctx, nil)
						testingutil.Expect(t, err, testingutil.Be[error](nil))

						t.Run("then could be list history", func(t *testing.T) {
							historyList, err := repo.ListKubePkgHistory(ctx, settingV2.DeploymentID, nil)
							testingutil.Expect(t, err, testingutil.Be[error](nil))
							testingutil.Expect(t, len(historyList), testingutil.Be(2))
							testingutil.Expect(t, listV2.Data[0].Annotations, testingutil.Equal(historyList[0].Annotations))
						})
					})
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
