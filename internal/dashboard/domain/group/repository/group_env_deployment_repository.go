package repository

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/davecgh/go-spew/spew"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg"
	"github.com/octohelm/kubepkg/pkg/datatypes"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/idgen"
	"github.com/octohelm/storage/pkg/dal"
	"github.com/octohelm/storage/pkg/sqlbuilder"
	"github.com/opencontainers/go-digest"
)

func NewGroupEnvDeploymentRepository(g *group.Env) *GroupEnvDeploymentRepository {
	return &GroupEnvDeploymentRepository{
		GroupEnv: g,
	}
}

type GroupEnvDeploymentRepository struct {
	GroupEnv *group.Env
}

func (r *GroupEnvDeploymentRepository) GetSetting(ctx context.Context, deploymentID group.DeploymentID, deploymentSettingID group.DeploymentSettingID) (map[string]any, error) {
	setting := &group.DeploymentSetting{}

	err := dal.From(group.DeploymentSettingT).
		Where(sqlbuilder.And(
			group.DeploymentSettingT.DeploymentID.V(sqlbuilder.Eq(deploymentID)),
			group.DeploymentSettingT.DeploymentSettingID.V(sqlbuilder.Eq(deploymentSettingID)),
		)).
		Select(group.DeploymentSettingT.EncryptedSetting).
		Scan(setting).
		Find(ctx)
	if err != nil {
		return nil, err
	}

	c := SeedForGroupEnv(r.GroupEnv).ToCipher()

	jsonRaw, err := c.Decrypt(ctx, setting.EncryptedSetting)
	if err != nil {
		return nil, err
	}

	m := map[string]any{}
	if err := json.Unmarshal(jsonRaw, &m); err != nil {
		return nil, err
	}
	return m, nil
}

func (r *GroupEnvDeploymentRepository) AddSetting(ctx context.Context, deploymentID group.DeploymentID, settings map[string]any) (*group.DeploymentSetting, error) {
	c := SeedForGroupEnv(r.GroupEnv).ToCipher()

	data, err := json.Marshal(settings)
	if err != nil {
		return nil, err
	}

	ds := &group.DeploymentSetting{}
	ds.Digest = digest.FromBytes(data).String()
	ds.DeploymentID = deploymentID

	encrypted, err := c.Encrypt(ctx, data)
	if err != nil {
		return nil, err
	}
	ds.EncryptedSetting = encrypted

	id, err := idgen.FromContextAndCast[group.DeploymentSettingID](ctx).ID()
	if err != nil {
		return nil, err
	}
	ds.DeploymentSettingID = id

	err = dal.Prepare(ds).
		OnConflict(group.DeploymentSettingT.I.IHash).DoNothing().
		Returning(
			group.DeploymentSettingT.DeploymentSettingID,
			group.DeploymentSettingT.CreatedAt,
		).
		Scan(ds).Save(ctx)
	if err != nil {
		return nil, err
	}

	return ds, nil
}

func (r *GroupEnvDeploymentRepository) RecordDeployment(ctx context.Context, deploymentID group.DeploymentID, kubepkgRef *kubepkg.Ref) error {
	deploymentHistory := &group.DeploymentHistory{}

	id, err := idgen.FromContextAndCast[group.DeploymentHistoryID](ctx).ID()
	if err != nil {
		return err
	}
	deploymentHistory.DeploymentHistoryID = id
	deploymentHistory.DeploymentID = deploymentID
	deploymentHistory.KubepkgID = kubepkgRef.KubepkgID
	deploymentHistory.KubepkgRevisionID = kubepkgRef.KubepkgRevisionID
	deploymentHistory.DeploymentSettingID = group.DeploymentSettingID(kubepkgRef.SettingID)

	return dal.Tx(ctx, deploymentHistory, func(ctx context.Context) error {
		err := dal.Prepare(deploymentHistory).Save(ctx)
		if err != nil {
			return err
		}

		// only remain last 10 deployment of each deployment
		return dal.Prepare(deploymentHistory).ForDelete().Where(
			sqlbuilder.And(
				group.DeploymentHistoryT.DeploymentID.V(sqlbuilder.Eq(deploymentID)),
				group.DeploymentHistoryT.DeploymentHistoryID.V(dal.NotInSelect(
					group.DeploymentHistoryT.DeploymentHistoryID,
					dal.From(group.DeploymentHistoryT).
						OrderBy(sqlbuilder.DescOrder(group.DeploymentHistoryT.CreatedAt)).
						Limit(10),
				)),
			),
		).Save(ctx)
	})
}

func (r *GroupEnvDeploymentRepository) ListKubePkgHistory(ctx context.Context, deploymentID group.DeploymentID, pager *datatypes.Pager) ([]*v1alpha1.KubePkg, error) {
	if pager == nil {
		pager = &datatypes.Pager{}
	}
	pager.SetDefaults()

	c := SeedForGroupEnv(r.GroupEnv).ToCipher()

	ltr := datatypes.NewLister(func(kk *struct {
		group.DeploymentHistory
		Deployment        group.Deployment
		DeploymentSetting group.DeploymentSetting
		Revision          kubepkg.Revision
		Version           kubepkg.Version
	}) (*v1alpha1.KubePkg, error) {
		k := &v1alpha1.KubePkg{}
		k.SetGroupVersionKind(v1alpha1.SchemeGroupVersion.WithKind("KubePkg"))

		// FieldName to overwrite
		k.Name = kk.Deployment.DeploymentName

		// FIXME consider remove this
		// domain repository should not use other domain's model directly
		if k.Annotations == nil {
			k.Annotations = map[string]string{}
		}
		k.Annotations["kubepkg.innoai.tech/revision"] = kk.Revision.ID.String()
		k.Spec.Version = kk.Version.Version + "+" + strings.ToLower(kk.Version.Channel.String())
		if err := json.Unmarshal(kk.Revision.Manifests, &k.Spec.Manifests); err != nil {
			return nil, err
		}

		if len(kk.DeploymentSetting.EncryptedSetting) > 0 {
			jsonRaw, err := c.Decrypt(ctx, kk.DeploymentSetting.EncryptedSetting)
			if err != nil {
				return nil, err
			}
			spew.Dump(jsonRaw)
		}

		// TODO merge setting

		return k, nil
	})

	err := dal.From(group.DeploymentHistoryT).
		Select(
			group.DeploymentHistoryT.CreatedAt,
			group.DeploymentT.DeploymentName,
			group.DeploymentSettingT.EncryptedSetting,

			kubepkg.RevisionT.ID,
			kubepkg.RevisionT.Manifests,

			kubepkg.VersionT.Version,
			kubepkg.VersionT.Channel,
		).
		Join(group.DeploymentT, sqlbuilder.And(
			group.DeploymentHistoryT.DeploymentID.V(sqlbuilder.Eq(deploymentID)),
			group.DeploymentT.DeploymentID.V(sqlbuilder.EqCol(group.DeploymentHistoryT.DeploymentID)),
		)).
		Join(group.DeploymentSettingT, sqlbuilder.And(
			group.DeploymentSettingT.DeploymentSettingID.V(
				sqlbuilder.EqCol(group.DeploymentHistoryT.DeploymentSettingID),
			),
		)).
		Join(kubepkg.RevisionT, sqlbuilder.And(
			kubepkg.RevisionT.ID.V(
				sqlbuilder.EqCol(group.DeploymentHistoryT.KubepkgRevisionID),
			),
		)).
		Join(kubepkg.VersionT, sqlbuilder.And(
			kubepkg.VersionT.RevisionID.V(
				sqlbuilder.EqCol(kubepkg.RevisionT.ID),
			),
		)).
		OrderBy(sqlbuilder.DescOrder(group.DeploymentHistoryT.CreatedAt)).
		Limit(pager.Size).Offset(pager.Offset).
		Scan(ltr).
		Find(ctx)
	if err != nil {
		return nil, err
	}

	return ltr.List(), nil
}

func (r *GroupEnvDeploymentRepository) BindKubepkg(ctx context.Context, deploymentName string, kubepkgRel group.KubepkgRel) (*group.Deployment, error) {
	d := &group.Deployment{}

	deploymentID, err := idgen.FromContextAndCast[group.DeploymentID](ctx).ID()
	if err != nil {
		return nil, err
	}
	d.DeploymentID = deploymentID
	d.DeploymentName = deploymentName
	d.KubepkgRel = kubepkgRel
	d.GroupEnvID = r.GroupEnv.EnvID

	err = dal.Prepare(d).
		OnConflict(group.DeploymentT.I.IDeploymentName).
		DoUpdateSet(
			group.DeploymentT.KubepkgChannel,
		).
		Returning(
			group.DeploymentT.DeploymentID,
			group.DeploymentT.KubepkgID,
			group.DeploymentT.CreatedAt,
			group.DeploymentT.UpdatedAt,
		).
		Scan(d).Save(ctx)
	if err != nil {
		return nil, err
	}

	return d, nil
}
