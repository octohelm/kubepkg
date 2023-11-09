package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/octohelm/courier/pkg/statuserror"

	"github.com/octohelm/storage/pkg/dberr"

	"github.com/octohelm/kubepkg/pkg/util"

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

func (r *GroupEnvDeploymentRepository) Get(ctx context.Context, deploymentID group.DeploymentID) (*group.Deployment, error) {
	deployment := &group.Deployment{}

	err := dal.From(group.DeploymentT).
		Where(sqlbuilder.And(
			group.DeploymentSettingT.DeploymentID.V(sqlbuilder.Eq(deploymentID)),
		)).
		Scan(deployment).
		Find(ctx)
	if err != nil {
		return nil, err
	}

	return deployment, nil
}

func (r *GroupEnvDeploymentRepository) GetSettingValues(ctx context.Context, deploymentID group.DeploymentID, deploymentSettingID group.DeploymentSettingID) (*group.DeploymentValues, error) {
	setting := &group.DeploymentSetting{}

	if deploymentSettingID == 0 {
		err := dal.From(group.DeploymentHistoryT).
			Where(sqlbuilder.And(group.DeploymentHistoryT.DeploymentID.V(sqlbuilder.Eq(deploymentID)))).
			OrderBy(sqlbuilder.DescOrder(group.DeploymentHistoryT.DeploymentHistoryID)).
			Limit(1).
			Select(group.DeploymentHistoryT.DeploymentSettingID).
			Scan(&deploymentSettingID).
			Find(ctx)
		if err != nil {
			if !dberr.IsErrNotFound(err) {
				return nil, err
			}
		}
	}

	if deploymentSettingID == 0 {
		return &group.DeploymentValues{}, nil
	}

	err := dal.From(group.DeploymentSettingT).
		Where(sqlbuilder.And(
			group.DeploymentSettingT.DeploymentID.V(sqlbuilder.Eq(deploymentID)),
			group.DeploymentSettingT.DeploymentSettingID.V(sqlbuilder.Eq(deploymentSettingID)),
		)).
		Select(group.DeploymentSettingT.EncryptedSetting).
		Scan(setting).
		Find(ctx)
	if err != nil {
		if dberr.IsErrNotFound(err) {
			return nil, statuserror.Wrap(err, http.StatusNotFound, "DeploymentSettingNotFound")
		}
		return nil, err
	}

	jsonRaw, err := r.cipher.Decrypt(ctx, setting.EncryptedSetting)
	if err != nil {
		return nil, err
	}

	overwrites := map[string]any{}
	if err := json.Unmarshal(jsonRaw, &overwrites); err != nil {
		return nil, err
	}
	return &group.DeploymentValues{
		DeploymentSettingID: deploymentSettingID,
		Values:              overwrites,
	}, nil
}

func (r *GroupEnvDeploymentRepository) RecordSetting(ctx context.Context, deploymentID group.DeploymentID, settings map[string]any) (*group.DeploymentSetting, error) {
	if settings == nil {
		settings = map[string]any{}
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

	deploymentHistory.KubepkgRevisionID = kubepkgRef.KubepkgRevisionID
	deploymentHistory.DeploymentSettingID = group.DeploymentSettingID(kubepkgRef.SettingID)

	deploymentHistory.DeploymentHistoryID = id
	deploymentHistory.DeploymentID = deploymentID
	deploymentHistory.KubepkgID = kubepkgRef.KubepkgID

	deploymentHistory.MarkCreatedAt()

	if err := dal.Tx(ctx, deploymentHistory, func(ctx context.Context) error {
		err := dal.Prepare(deploymentHistory).
			OnConflict(group.DeploymentHistoryT.I.IDeploymentRevision).
			DoUpdateSet(
				// FIXME ugly here to order the latest
				group.DeploymentHistoryT.DeploymentHistoryID,
				group.DeploymentHistoryT.CreatedAt,
			).
			Returning(
				group.DeploymentHistoryT.DeploymentID,
			).
			Scan(deploymentHistory).
			Save(ctx)
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
						Where(group.DeploymentHistoryT.DeploymentID.V(sqlbuilder.Eq(deploymentID))).
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

func (r *GroupEnvDeploymentRepository) ListKubepkg(ctx context.Context, pager *datatypes.Pager) (*v1alpha1.KubePkgList, error) {
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
				GroupBy(
					group.DeploymentHistoryT.DeploymentID,
				).
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
		Join(kubepkg.KubepkgT, kubepkg.KubepkgT.ID.V(
			sqlbuilder.EqCol(group.DeploymentHistoryT.KubepkgID),
		)).
		FullJoin(kubepkg.VersionT, sqlbuilder.And(
			kubepkg.VersionT.KubepkgID.V(
				sqlbuilder.EqCol(kubepkg.KubepkgT.ID),
			),
			kubepkg.VersionT.RevisionID.V(
				sqlbuilder.EqCol(kubepkg.RevisionT.ID),
			),
			kubepkg.VersionT.Channel.V(
				sqlbuilder.EqCol(group.DeploymentT.KubepkgChannel),
			),
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

			kubepkg.KubepkgT.Group,
			kubepkg.KubepkgT.Name,
		)

	ltr := datatypes.NewLister(func(kk *struct {
		Deployment        group.Deployment
		DeploymentHistory group.DeploymentHistory
		DeploymentSetting group.DeploymentSetting
		Revision          kubepkg.Revision
		Version           kubepkg.Version
		Kubepkg           kubepkg.Kubepkg
	}) (*v1alpha1.KubePkg, error) {
		k := &v1alpha1.KubePkg{}
		k.SetGroupVersionKind(v1alpha1.SchemeGroupVersion.WithKind("KubePkg"))

		k.Name = kk.Deployment.DeploymentName
		k.Namespace = r.GroupEnv.Namespace

		if k.Annotations == nil {
			k.Annotations = map[string]string{}
		}

		k.CreationTimestamp = metav1.NewTime(time.Time(kk.DeploymentHistory.CreatedAt))

		if kk.Version.Channel == kubepkg.CHANNEL_UNKNOWN {
			kk.Version.Channel = kubepkg.CHANNEL__DEV
		}

		k.Annotations[kubepkg.AnnotationDeploymentID] = kk.DeploymentHistory.DeploymentID.String()
		k.Annotations[kubepkg.AnnotationDeploymentSettingID] = kk.DeploymentHistory.DeploymentSettingID.String()
		k.Annotations[kubepkg.AnnotationRevision] = kk.Revision.ID.String()
		k.Annotations[kubepkg.AnnotationName] = fmt.Sprintf("%s/%s", kk.Kubepkg.Group, kk.Kubepkg.Name)
		k.Annotations[kubepkg.AnnotationChannel] = kk.Version.Channel.String()

		k.Spec.Version = kk.Version.Version

		if err := json.Unmarshal(kk.Revision.Spec, &k.Spec); err != nil {
			return nil, errors.Wrapf(err, "KubePkg %s unmarshal to json failed", kk.Kubepkg.ID)
		}

		if len(kk.DeploymentSetting.EncryptedSetting) > 0 {
			data, err := r.cipher.Decrypt(ctx, kk.DeploymentSetting.EncryptedSetting)
			if err != nil {
				return nil, err
			}

			overwrites, err := tryToResolveOverwrites(data)
			if err != nil {
				return nil, err
			}
			k.Annotations[kubepkg.AnnotationOverwrites] = util.BytesToString(overwrites)
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

	items := ltr.List()
	list := &v1alpha1.KubePkgList{
		Items: make([]v1alpha1.KubePkg, len(items)),
	}
	list.SetGroupVersionKind(v1alpha1.SchemeGroupVersion.WithKind("KubePkgList"))

	for i := range items {
		list.Items[i] = *items[i]
	}

	return list, nil
}

func (r *GroupEnvDeploymentRepository) ListKubePkgHistory(ctx context.Context, deploymentID group.DeploymentID, pager *datatypes.Pager) ([]*v1alpha1.KubePkg, error) {
	if pager == nil {
		pager = &datatypes.Pager{}
	}
	pager.SetDefaults()

	expr := dal.From(group.DeploymentHistoryT).
		Join(group.DeploymentT, sqlbuilder.And(
			group.DeploymentT.DeploymentID.V(sqlbuilder.EqCol(group.DeploymentHistoryT.DeploymentID)),
		)).
		Join(kubepkg.RevisionT, kubepkg.RevisionT.ID.V(
			sqlbuilder.EqCol(group.DeploymentHistoryT.KubepkgRevisionID),
		)).
		Join(kubepkg.KubepkgT, kubepkg.KubepkgT.ID.V(
			sqlbuilder.EqCol(group.DeploymentHistoryT.KubepkgID),
		)).
		FullJoin(kubepkg.VersionT, sqlbuilder.And(
			kubepkg.VersionT.KubepkgID.V(
				sqlbuilder.EqCol(kubepkg.KubepkgT.ID),
			),
			kubepkg.VersionT.RevisionID.V(
				sqlbuilder.EqCol(kubepkg.RevisionT.ID),
			),
		)).
		FullJoin(group.DeploymentSettingT, group.DeploymentSettingT.DeploymentSettingID.V(
			sqlbuilder.EqCol(group.DeploymentHistoryT.DeploymentSettingID),
		)).
		Select(
			group.DeploymentT.DeploymentName,

			group.DeploymentHistoryT.CreatedAt,
			group.DeploymentHistoryT.DeploymentID,
			group.DeploymentHistoryT.DeploymentSettingID,
			group.DeploymentHistoryT.DeploymentHistoryID,
			group.DeploymentHistoryT.KubepkgRevisionID,

			group.DeploymentSettingT.EncryptedSetting,

			kubepkg.RevisionT.ID,
			kubepkg.RevisionT.Spec,

			kubepkg.VersionT.Version,
			kubepkg.VersionT.Channel,

			kubepkg.KubepkgT.Group,
			kubepkg.KubepkgT.Name,
		)

	ltr := datatypes.NewLister(func(kk *struct {
		Deployment        group.Deployment
		DeploymentHistory group.DeploymentHistory
		DeploymentSetting group.DeploymentSetting
		Revision          kubepkg.Revision
		Version           kubepkg.Version
		Kubepkg           kubepkg.Kubepkg
	}) (*v1alpha1.KubePkg, error) {
		k := &v1alpha1.KubePkg{}
		k.SetGroupVersionKind(v1alpha1.SchemeGroupVersion.WithKind("KubePkg"))

		// FieldName to overwrite
		k.Name = kk.Deployment.DeploymentName
		k.Namespace = r.GroupEnv.Namespace

		k.CreationTimestamp = metav1.NewTime(time.Time(kk.DeploymentHistory.CreatedAt))

		if k.Annotations == nil {
			k.Annotations = map[string]string{}
		}

		k.Annotations[kubepkg.AnnotationRevision] = kk.DeploymentHistory.KubepkgRevisionID.String()
		k.Annotations[kubepkg.AnnotationDeploymentID] = kk.DeploymentHistory.DeploymentID.String()
		k.Annotations[kubepkg.AnnotationDeploymentSettingID] = kk.DeploymentHistory.DeploymentSettingID.String()
		k.Annotations[kubepkg.AnnotationName] = fmt.Sprintf("%s/%s", kk.Kubepkg.Group, kk.Kubepkg.Name)
		k.Annotations[kubepkg.AnnotationChannel] = kk.Version.Channel.String()

		k.Spec.Version = kk.Version.Version

		if err := json.Unmarshal(kk.Revision.Spec, &k.Spec); err != nil {
			return nil, errors.Wrap(err, "KubePkg unmarshal to json failed")
		}

		if len(kk.DeploymentSetting.EncryptedSetting) > 0 {
			data, err := r.cipher.Decrypt(ctx, kk.DeploymentSetting.EncryptedSetting)
			if err != nil {
				return nil, err
			}

			overwrites, err := tryToResolveOverwrites(data)
			if err != nil {
				return nil, err
			}
			k.Annotations[kubepkg.AnnotationOverwrites] = util.BytesToString(overwrites)
		}

		return k, nil
	})

	err := expr.
		Where(
			group.DeploymentHistoryT.DeploymentID.V(sqlbuilder.Eq(deploymentID)),
		).
		OrderBy(
			sqlbuilder.DescOrder(group.DeploymentHistoryT.DeploymentHistoryID),
		).
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

func (v *GroupEnvDeploymentRepository) Delete(ctx context.Context, deploymentName string) error {
	return dal.Prepare(group.DeploymentT).ForDelete().
		Where(sqlbuilder.And(
			group.DeploymentT.GroupEnvID.V(sqlbuilder.Eq(v.GroupEnv.EnvID)),
			group.DeploymentT.DeploymentName.V(sqlbuilder.Eq(deploymentName)),
		)).
		Save(ctx)
}

func tryToResolveOverwrites(data []byte) ([]byte, error) {
	config := map[string]any{}

	if err := json.Unmarshal(data, &config); err == nil {
		if _, isOverwrites := config["spec"]; !isOverwrites {
			return json.Marshal(map[string]any{
				"spec": map[string]any{
					"config": config,
				},
			})
		}
	}

	return data, nil
}
