package service

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
	_ "time/tzdata"

	"github.com/octohelm/courier/pkg/statuserror"

	"github.com/octohelm/kubepkg/pkg/util"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	grouprepository "github.com/octohelm/kubepkg/internal/dashboard/domain/group/repository"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg"
	kubepkgrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg/repository"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/datatypes"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func NewGroupEnvDeploymentService(group *group.Group, env *group.Env) *GroupEnvDeploymentService {
	return &GroupEnvDeploymentService{
		group:                  group,
		groupEnvDeploymentRepo: grouprepository.NewGroupEnvDeploymentRepository(env),
		kubepkgRepo:            kubepkgrepository.NewKubepkgRepository(),
	}
}

type GroupEnvDeploymentService struct {
	group                  *group.Group
	groupEnvDeploymentRepo *grouprepository.GroupEnvDeploymentRepository
	kubepkgRepo            *kubepkgrepository.KubepkgRepository
}

func (s *GroupEnvDeploymentService) ListKubePkgHistory(ctx context.Context, deploymentID group.DeploymentID, pager *datatypes.Pager) ([]*v1alpha1.KubePkg, error) {
	return s.groupEnvDeploymentRepo.ListKubePkgHistory(ctx, deploymentID, pager)
}

func (s *GroupEnvDeploymentService) ListKubePkg(ctx context.Context, pager *datatypes.Pager) (*v1alpha1.KubePkgList, error) {
	return s.groupEnvDeploymentRepo.ListKubepkg(ctx, pager)
}

func (s *GroupEnvDeploymentService) PutKubePkg(ctx context.Context, pkg *v1alpha1.KubePkg) (*v1alpha1.KubePkg, error) {
	namespace := pkg.Namespace

	pkg.Namespace = s.group.Name
	kpkg, kpkgRef, err := s.kubepkgRepo.Put(ctx, pkg)
	if err != nil {
		return nil, statuserror.Wrap(err, http.StatusBadRequest, "InvalidKubePkg")
	}

	kpkg.Namespace = namespace

	deployment, err := s.groupEnvDeploymentRepo.BindKubepkg(ctx, kpkg.Name, group.KubepkgRel{
		KubepkgID:      kpkgRef.KubepkgID,
		KubepkgChannel: kubepkg.CHANNEL__DEV,
	})
	if err != nil {
		return nil, err
	}

	var settingID uint64

	if overwrites := kpkgRef.Overwrites; overwrites != nil {
		deploymentSetting, err := s.groupEnvDeploymentRepo.RecordSetting(ctx, deployment.DeploymentID, overwrites)
		if err != nil {
			return nil, err
		}
		settingID = uint64(deploymentSetting.DeploymentSettingID)
	} else {
		deploymentSettingValues, err := s.groupEnvDeploymentRepo.GetSettingValues(ctx, deployment.DeploymentID, 0)
		if err != nil {
			return nil, err
		}

		if deploymentSettingValues.Values == nil {
			deploymentSetting, err := s.groupEnvDeploymentRepo.RecordSetting(ctx, deployment.DeploymentID, kpkgRef.DefaultsOverwrites)
			if err != nil {
				return nil, err
			}
			kpkgRef.Overwrites = kpkgRef.DefaultsOverwrites
			settingID = uint64(deploymentSetting.DeploymentSettingID)
		} else {
			kpkgRef.Overwrites = deploymentSettingValues.Values
			settingID = uint64(deploymentSettingValues.DeploymentSettingID)
		}
	}

	deploymentHistory, err := s.groupEnvDeploymentRepo.RecordDeployment(ctx, deployment.DeploymentID, kpkgRef.WithSettingID(settingID))
	if err != nil {
		return nil, err
	}

	kpkg.CreationTimestamp = metav1.NewTime(time.Time(deploymentHistory.CreatedAt))

	if kpkg.Annotations == nil {
		kpkg.Annotations = map[string]string{}
	}

	if kpkgRef.Overwrites != nil {
		overwritesData, _ := json.Marshal(kpkgRef.Overwrites)
		kpkg.Annotations[kubepkg.AnnotationOverwrites] = util.BytesToString(overwritesData)
	}

	kpkg.Annotations[kubepkg.AnnotationChannel] = deployment.KubepkgChannel.String()
	kpkg.Annotations[kubepkg.AnnotationDeploymentID] = deploymentHistory.DeploymentID.String()
	kpkg.Annotations[kubepkg.AnnotationDeploymentSettingID] = deploymentHistory.DeploymentSettingID.String()

	return kpkg, nil
}

func (s *GroupEnvDeploymentService) Delete(ctx context.Context, deploymentName string) error {
	return s.groupEnvDeploymentRepo.Delete(ctx, deploymentName)
}
