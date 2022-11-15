package repository

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/opencontainers/go-digest"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg"
	"github.com/octohelm/kubepkg/pkg/datatypes"
	"github.com/octohelm/kubepkg/pkg/idgen"
	"github.com/octohelm/storage/pkg/dal"
	"github.com/octohelm/storage/pkg/sqlbuilder"
)

func NewKubepkgRepository() *KubepkgRepository {
	return &KubepkgRepository{}
}

type KubepkgRepository struct {
}

func (KubepkgRepository) Add(ctx context.Context, k *v1alpha1.KubePkg) (*v1alpha1.KubePkg, *kubepkg.Ref, error) {
	kpkg := &kubepkg.Kubepkg{}
	kpkg.Group = k.Namespace
	kpkg.Name = k.Name

	revision := &kubepkg.Revision{}
	version := &kubepkg.Version{}
	version.Channel = kubepkg.CHANNEL__DEV
	version.Version = k.Spec.Version

	ref := &kubepkg.Ref{}

	if config := k.Spec.Config; config != nil {
		ref.DefaultSettings = map[string]string{}
		for k := range config {
			vv, _ := config[k].MarshalText()
			ref.DefaultSettings[k] = string(vv)
		}
		k.Spec.Config = nil
	}

	data, err := json.Marshal(k.Spec)
	if err != nil {
		return nil, nil, err
	}

	revision.Spec = data
	revision.Digest = digest.FromBytes(data).String()

	id, err := idgen.FromContextAndCast[kubepkg.ID](ctx).ID()
	if err != nil {
		return nil, nil, err
	}

	kpkg.ID = id
	revision.ID = kubepkg.RevisionID(id)
	version.ID = datatypes.SFID(id)

	if err := dal.Tx(ctx, kpkg, func(ctx context.Context) error {
		err := dal.Prepare(kpkg).
			OnConflict(kubepkg.KubepkgT.I.IName).DoNothing().
			Returning(
				kubepkg.KubepkgT.ID,
				kubepkg.KubepkgT.CreatedAt,
				kubepkg.KubepkgT.UpdatedAt,
			).
			Scan(kpkg).
			Save(ctx)
		if err != nil {
			return err
		}

		// bind to kubepkg
		revision.KubepkgID = kpkg.ID

		err = dal.Prepare(revision).
			OnConflict(kubepkg.RevisionT.I.IDigest).DoNothing().
			Returning(
				kubepkg.RevisionT.ID,
				kubepkg.RevisionT.CreatedAt,
			).
			Scan(revision).
			Save(ctx)

		if err != nil {
			return err
		}

		version.RevisionID = revision.ID

		return dal.Prepare(version).
			OnConflict(kubepkg.VersionT.I.IVersion).
			DoUpdateSet(kubepkg.VersionT.RevisionID).
			Returning(
				kubepkg.VersionT.ID,
				kubepkg.VersionT.CreatedAt,
			).
			Scan(version).
			Save(ctx)
	}); err != nil {
		return nil, nil, err
	}

	if k.Annotations == nil {
		k.Annotations = map[string]string{}
	}

	k.Annotations["kubepkg.innoai.tech/revision"] = revision.ID.String()
	k.Spec.Version = version.Version

	ref.KubepkgID = kpkg.ID
	ref.KubepkgRevisionID = revision.ID

	return k, ref, nil
}

func (KubepkgRepository) Delete(ctx context.Context, group string, name string) error {
	return dal.Prepare(kubepkg.KubepkgT).ForDelete().
		Where(sqlbuilder.And(
			kubepkg.KubepkgT.Group.V(sqlbuilder.Eq(group)),
			kubepkg.KubepkgT.Name.V(sqlbuilder.Eq(name)),
		)).
		Save(ctx)
}

func (KubepkgRepository) ListVersion(ctx context.Context, group string, name string, channel kubepkg.Channel, where sqlbuilder.SqlCondition, pager *datatypes.Pager) ([]*v1alpha1.KubePkg, error) {
	if pager == nil {
		pager = &datatypes.Pager{}
	}
	pager.SetDefaults()

	ltr := datatypes.NewLister(func(kk *struct {
		kubepkg.Revision
		kubepkg.Kubepkg
		Version kubepkg.Version
	}) (*v1alpha1.KubePkg, error) {
		k := &v1alpha1.KubePkg{}
		k.SetGroupVersionKind(v1alpha1.SchemeGroupVersion.WithKind("KubePkg"))

		k.Name = kk.Name
		k.Namespace = kk.Group

		if k.Annotations == nil {
			k.Annotations = map[string]string{}
		}
		k.Annotations["kubepkg.innoai.tech/revision"] = kk.Revision.ID.String()
		k.Spec.Version = kk.Version.Version + "+" + strings.ToLower(kk.Version.Channel.String())

		if err := json.Unmarshal(kk.Revision.Spec, &k.Spec); err != nil {
			return nil, err
		}
		return k, nil
	})

	err := dal.From(kubepkg.VersionT).
		Join(kubepkg.RevisionT, sqlbuilder.And(
			kubepkg.VersionT.RevisionID.V(sqlbuilder.EqCol(kubepkg.RevisionT.ID)),
			kubepkg.VersionT.Channel.V(sqlbuilder.Eq(channel)),
		)).
		Join(kubepkg.KubepkgT, sqlbuilder.And(
			kubepkg.KubepkgT.ID.V(sqlbuilder.EqCol(kubepkg.RevisionT.KubepkgID)),
			kubepkg.KubepkgT.Group.V(sqlbuilder.Eq(group)),
			kubepkg.KubepkgT.Name.V(sqlbuilder.Eq(name)),
		)).
		Where(where).
		OrderBy(sqlbuilder.DescOrder(kubepkg.VersionT.Version)).
		Limit(pager.Size).Offset(pager.Offset).
		Scan(ltr).
		Find(ctx)
	if err != nil {
		return nil, err
	}

	return ltr.List(), nil
}

func (KubepkgRepository) DeleteRevision(ctx context.Context, revisionID kubepkg.RevisionID) error {
	return dal.Prepare(kubepkg.RevisionT).ForDelete().
		Where(sqlbuilder.And(
			kubepkg.RevisionT.ID.V(sqlbuilder.Eq(revisionID)),
		)).
		Save(ctx)
}
