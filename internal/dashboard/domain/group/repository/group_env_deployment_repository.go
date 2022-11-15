package repository

import (
	"context"
	"encoding/json"
	"time"

	"github.com/pkg/errors"

	"github.com/octohelm/kubepkg/pkg/vault"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

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
		cipher:   SeedForGroupEnv(g).ToCipher(),
	}
}

type GroupEnvDeploymentRepository struct {
	GroupEnv *group.Env
	cipher   vault.Cipher
}

func (r *GroupEnvDeploymentRepository) GetSetting(ctx context.Context, deploymentID group.DeploymentID, deploymentSettingID group.DeploymentSettingID) (map[string]string, error) {
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

	jsonRaw, err := r.cipher.Decrypt(ctx, setting.EncryptedSetting)
	if err != nil {
		return nil, err
	}

	m := map[string]string{}
	if err := json.Unmarshal(jsonRaw, &m); err != nil {
		return nil, err
	}
	return m, nil
}

func (r *GroupEnvDeploymentRepository) RecordSetting(ctx context.Context, deploymentID group.DeploymentID, settings map[string]string) (*group.DeploymentSetting, error) {
	if settings == nil {
		settings = map[string]string{}
	}
	data, err := json.Marshal(settings)
	if err != nil {
		return nil, err
	}

	ds := &group.DeploymentSetting{}
	ds.Digest = digest.FromBytes(data).String()
	ds.DeploymentID = deploymentID

	encrypted, err := r.cipher.Encrypt(ctx, data)
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

func (r *GroupEnvDeploymentRepository) RecordDeployment(ctx context.Context, deploymentID group.DeploymentID, kubepkgRef *kubepkg.Ref) (*group.DeploymentHistory, error) {
	deploymentHistory := &group.DeploymentHistory{}

	id, err := idgen.FromContextAndCast[group.DeploymentHistoryID](ctx).ID()
	if err != nil {
		return nil, err
	}
	deploymentHistory.DeploymentHistoryID = id
	deploymentHistory.DeploymentID = deploymentID
	deploymentHistory.KubepkgID = kubepkgRef.KubepkgID
	deploymentHistory.KubepkgRevisionID = kubepkgRef.KubepkgRevisionID
	deploymentHistory.DeploymentSettingID = group.DeploymentSettingID(kubepkgRef.SettingID)

	if err := dal.Tx(ctx, deploymentHistory, func(ctx context.Context) error {
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
	}); err != nil {
		return nil, err
	}
	return deploymentHistory, nil
}

func (r *GroupEnvDeploymentRepository) ListKubepkg(ctx context.Context, pager *datatypes.Pager) (*group.DeploymentDataList, error) {
	if pager == nil {
		pager = &datatypes.Pager{}
	}

	pager.SetDefaults()

	tLatestDeployment := sqlbuilder.T(
		"t_latest_deployment",
		group.DeploymentHistoryT.DeploymentID,
		group.DeploymentHistoryT.DeploymentHistoryID,
	)

	expr := dal.From(group.DeploymentT).
		With(tLatestDeployment, func(table sqlbuilder.Table) sqlbuilder.SqlExpr {
			return dal.
				From(group.DeploymentHistoryT).
				GroupBy(group.DeploymentHistoryT.DeploymentID).
				Select(
					group.DeploymentHistoryT.DeploymentID,
					sqlbuilder.Max(group.DeploymentHistoryT.DeploymentHistoryID),
				)
		}).
		Join(tLatestDeployment, group.DeploymentT.DeploymentID.V(
			sqlbuilder.EqCol(sqlbuilder.CastCol[group.DeploymentID](tLatestDeployment.F(group.DeploymentHistoryT.DeploymentID.Name()))),
		)).
		Join(group.DeploymentHistoryT, group.DeploymentHistoryT.DeploymentHistoryID.V(
			sqlbuilder.EqCol(sqlbuilder.CastCol[group.DeploymentHistoryID](tLatestDeployment.F(group.DeploymentHistoryT.DeploymentHistoryID.Name()))),
		)).
		Join(kubepkg.RevisionT, kubepkg.RevisionT.ID.V(
			sqlbuilder.EqCol(group.DeploymentHistoryT.KubepkgRevisionID),
		)).
		Join(kubepkg.VersionT, kubepkg.VersionT.RevisionID.V(
			sqlbuilder.EqCol(kubepkg.RevisionT.ID),
		)).
		FullJoin(group.DeploymentSettingT, group.DeploymentSettingT.DeploymentSettingID.V(
			sqlbuilder.EqCol(group.DeploymentHistoryT.DeploymentSettingID),
		)).
		Select(
			group.DeploymentT.DeploymentName,

			group.DeploymentHistoryT.DeploymentID,
			group.DeploymentHistoryT.DeploymentSettingID,
			group.DeploymentHistoryT.CreatedAt,

			group.DeploymentSettingT.EncryptedSetting,

			kubepkg.RevisionT.ID,
			kubepkg.RevisionT.Spec,

			kubepkg.VersionT.Version,
			kubepkg.VersionT.Channel,
		)

	ltr := datatypes.NewLister(func(kk *struct {
		Deployment        group.Deployment
		DeploymentHistory group.DeploymentHistory
		DeploymentSetting group.DeploymentSetting
		Revision          kubepkg.Revision
		Version           kubepkg.Version
	}) (*v1alpha1.KubePkg, error) {
		k := &v1alpha1.KubePkg{}
		k.SetGroupVersionKind(v1alpha1.SchemeGroupVersion.WithKind("KubePkg"))

		k.Name = kk.Deployment.DeploymentName
		k.Namespace = r.GroupEnv.Namespace

		if k.Annotations == nil {
			k.Annotations = map[string]string{}
		}

		k.CreationTimestamp = metav1.NewTime(time.Time(kk.DeploymentHistory.CreatedAt))

		k.Annotations["kubepkg.innoai.tech/revision"] = kk.Revision.ID.String()
		k.Annotations["kubepkg.innoai.tech/deploymentID"] = kk.DeploymentHistory.DeploymentID.String()
		k.Annotations["kubepkg.innoai.tech/deploymentSettingID"] = kk.DeploymentHistory.DeploymentSettingID.String()

		k.Spec.Version = kk.Version.Version

		if err := json.Unmarshal(kk.Revision.Spec, &k.Spec); err != nil {
			return nil, errors.Wrap(err, "KubePkg unmarshal to json failed")
		}

		if len(kk.DeploymentSetting.EncryptedSetting) > 0 {
			data, err := r.cipher.Decrypt(ctx, kk.DeploymentSetting.EncryptedSetting)
			if err != nil {
				return nil, err
			}

			if err := json.Unmarshal(data, &k.Spec.Config); err != nil {
				return nil, errors.Wrap(err, "Setting unmarshal to json failed")
			}
		}

		return k, nil
	})

	err := expr.
		Limit(pager.Size).Offset(pager.Offset).
		Where(group.DeploymentT.GroupEnvID.V(sqlbuilder.Eq(r.GroupEnv.EnvID))).
		Scan(ltr).
		Find(ctx)
	if err != nil {
		return nil, err
	}

	return &group.DeploymentDataList{
		Data: ltr.List(),
	}, nil
}

func (r *GroupEnvDeploymentRepository) ListKubePkgHistory(ctx context.Context, deploymentID group.DeploymentID, pager *datatypes.Pager) ([]*v1alpha1.KubePkg, error) {
	if pager == nil {
		pager = &datatypes.Pager{}
	}

	pager.SetDefaults()

	ltr := datatypes.NewLister(func(kk *struct {
		Deployment        group.Deployment
		DeploymentHistory group.DeploymentHistory
		Revision          kubepkg.Revision
		Version           kubepkg.Version
	}) (*v1alpha1.KubePkg, error) {
		k := &v1alpha1.KubePkg{}
		k.SetGroupVersionKind(v1alpha1.SchemeGroupVersion.WithKind("KubePkg"))

		// FieldName to overwrite
		k.Name = kk.Deployment.DeploymentName
		k.Namespace = r.GroupEnv.Namespace

		if k.Annotations == nil {
			k.Annotations = map[string]string{}
		}

		k.CreationTimestamp = metav1.NewTime(time.Time(kk.DeploymentHistory.CreatedAt))

		k.Annotations["kubepkg.innoai.tech/revision"] = kk.DeploymentHistory.KubepkgRevisionID.String()
		k.Annotations["kubepkg.innoai.tech/deploymentID"] = kk.DeploymentHistory.DeploymentID.String()
		k.Annotations["kubepkg.innoai.tech/deploymentSettingID"] = kk.DeploymentHistory.DeploymentSettingID.String()

		k.Spec.Version = kk.Version.Version

		if err := json.Unmarshal(kk.Revision.Spec, &k.Spec); err != nil {
			return nil, err
		}

		return k, nil
	})

	err := dal.From(group.DeploymentHistoryT).
		Select(
			group.DeploymentT.DeploymentName,

			group.DeploymentHistoryT.CreatedAt,
			group.DeploymentHistoryT.DeploymentID,
			group.DeploymentHistoryT.DeploymentSettingID,

			kubepkg.RevisionT.ID,
			kubepkg.RevisionT.Spec,

			kubepkg.VersionT.Version,
			kubepkg.VersionT.Channel,
		).
		Join(group.DeploymentT, sqlbuilder.And(
			group.DeploymentHistoryT.DeploymentID.V(sqlbuilder.Eq(deploymentID)),
			group.DeploymentT.DeploymentID.V(sqlbuilder.EqCol(group.DeploymentHistoryT.DeploymentID)),
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
		OrderBy(sqlbuilder.DescOrder(group.DeploymentHistoryT.DeploymentHistoryID)).
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
