package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/octohelm/storage/pkg/dberr"
	"github.com/opencontainers/go-digest"

	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/octohelm/kubepkg/pkg/util"
	"github.com/pkg/errors"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/datatypes"
	"github.com/octohelm/kubepkg/pkg/idgen"
	"github.com/octohelm/kubepkg/pkg/version/semver"
	"github.com/octohelm/storage/pkg/dal"
	"github.com/octohelm/storage/pkg/sqlbuilder"
)

func NewKubepkgRepository() *KubepkgRepository {
	return &KubepkgRepository{}
}

type KubepkgRepository struct {
}

func (r *KubepkgRepository) Put(ctx context.Context, k *v1alpha1.KubePkg) (*v1alpha1.KubePkg, *kubepkg.Ref, error) {
	kk := &v1alpha1.KubePkg{}
	kk.SetGroupVersionKind(v1alpha1.SchemeGroupVersion.WithKind("KubePkg"))
	kk.Name = k.Name
	kk.Namespace = k.Namespace

	if kk.Annotations == nil {
		kk.Annotations = map[string]string{}
	}

	kpkg := &kubepkg.Kubepkg{}
	kpkg.Group = k.Namespace
	kpkg.Name = k.Name

	revision := &kubepkg.Revision{}

	version := &kubepkg.Version{}
	version.Channel = kubepkg.CHANNEL__DEV

	ref := &kubepkg.Ref{}

	if k.Annotations != nil {
		if n, ok := k.Annotations[kubepkg.AnnotationName]; ok {
			parts := strings.Split(n, "/")
			if len(parts) == 2 {
				kpkg.Group = parts[0]
				kpkg.Name = parts[1]
			}
		}

		if reversionID, ok := k.Annotations[kubepkg.AnnotationRevision]; ok {
			_ = revision.ID.UnmarshalText([]byte(reversionID))
		}

		if c, ok := k.Annotations[kubepkg.AnnotationChannel]; ok {
			_ = version.Channel.UnmarshalText([]byte(c))
		}

		if overwrites, ok := k.Annotations[kubepkg.AnnotationOverwrites]; ok {
			_ = json.Unmarshal(util.StringToBytes(overwrites), &ref.Overwrites)
		}
	}

	ref.KubepkgRevisionID = revision.ID
	id, err := idgen.FromContextAndCast[kubepkg.ID](ctx).ID()
	if err != nil {
		return nil, nil, err
	}
	kpkg.ID = id
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

		if revision.ID != 0 {
			err = dal.From(kubepkg.RevisionT).
				Where(
					sqlbuilder.And(
						kubepkg.RevisionT.ID.V(sqlbuilder.Eq(revision.ID)),
						kubepkg.RevisionT.KubepkgID.V(sqlbuilder.Eq(revision.KubepkgID)),
					),
				).
				Limit(1).Scan(revision).Find(ctx)
			if err != nil {
				if !dberr.IsErrNotFound(err) {
					return err
				}

				revision.ID = 0
				ref.KubepkgRevisionID = revision.ID
			}
		}

		if revision.ID == 0 {
			// try creat new revision
			revision.ID = kubepkg.RevisionID(id)

			data, err := json.Marshal(k.Spec)
			if err != nil {
				return err
			}

			revision.Spec = data
			revision.Digest = digest.FromBytes(data).String()

			err = dal.Prepare(revision).
				OnConflict(kubepkg.RevisionT.I.IDigest).
				DoNothing().
				Returning(
					kubepkg.RevisionT.ID,
					kubepkg.RevisionT.Spec,
					kubepkg.RevisionT.CreatedAt,
				).
				Scan(revision).
				Save(ctx)
			if err != nil {
				return err
			}
		}

		if err := json.Unmarshal(revision.Spec, &kk.Spec); err != nil {
			return err
		}

		version.Version = kk.Spec.Version

		version.KubepkgID = kpkg.ID
		version.RevisionID = revision.ID

		if sv := semver.Parse(version.Version); sv != nil {
			version.Major, version.Minor, version.Patch = sv.Major, sv.Minor, sv.Patch
		}

		return dal.Prepare(version).
			OnConflict(kubepkg.VersionT.I.IVersion).
			DoUpdateSet(
				kubepkg.VersionT.Major,
				kubepkg.VersionT.Minor,
				kubepkg.VersionT.Patch,
				kubepkg.VersionT.RevisionID,
				kubepkg.VersionT.KubepkgID,
			).
			Returning(
				kubepkg.VersionT.ID,
				kubepkg.VersionT.CreatedAt,
			).
			Scan(version).
			Save(ctx)
	}); err != nil {
		return nil, nil, err
	}

	if ref.Overwrites == nil {
		if ref.KubepkgRevisionID == 0 {
			// when create new
			// use config as default overwrites
			if ref.Overwrites == nil {
				if config := k.Spec.Config; config != nil {
					c := map[string]any{}
					for k := range config {
						vv, _ := config[k].MarshalText()
						c[k] = string(vv)
					}
					ref.DefaultsOverwrites = map[string]any{
						"spec": map[string]any{
							"config": c,
						},
					}
				}
			}
		} else {
			diffed, err := util.Diff(&kk.Spec, &k.Spec)
			if err != nil {
				return nil, nil, err
			}
			ref.Overwrites = map[string]any{
				"spec": diffed,
			}
		}
	}

	ref.KubepkgID = kpkg.ID
	ref.KubepkgRevisionID = revision.ID

	kk.Annotations[kubepkg.AnnotationName] = fmt.Sprintf("%s/%s", kpkg.Group, kpkg.Name)
	kk.Annotations[kubepkg.AnnotationChannel] = version.Channel.String()
	kk.Annotations[kubepkg.AnnotationRevision] = ref.KubepkgRevisionID.String()

	return kk, ref, nil
}

func (KubepkgRepository) Delete(ctx context.Context, group string, name string) error {
	return dal.Prepare(kubepkg.KubepkgT).ForDelete().
		Where(sqlbuilder.And(
			kubepkg.KubepkgT.Group.V(sqlbuilder.Eq(group)),
			kubepkg.KubepkgT.Name.V(sqlbuilder.Eq(name)),
		)).
		Save(ctx)
}

func (r KubepkgRepository) List(ctx context.Context, groupName string, params kubepkg.KubepkgQueryParams) ([]*kubepkg.Kubepkg, error) {
	params.Pager.SetDefaults()

	where := sqlbuilder.And(
		kubepkg.KubepkgT.Group.V(sqlbuilder.Eq(groupName)),
		kubepkg.KubepkgT.Name.V(datatypes.RightLikeOrIn(params.Names...)),
	)

	ltr := datatypes.NewLister(func(k *kubepkg.Kubepkg) (*kubepkg.Kubepkg, error) {
		return k, nil
	})

	err := dal.From(kubepkg.KubepkgT).
		Where(where).
		OrderBy(
			sqlbuilder.DescOrder(kubepkg.KubepkgT.Group),
			sqlbuilder.DescOrder(kubepkg.KubepkgT.Name),
		).
		Limit(params.Pager.Size).
		Offset(params.Pager.Offset).
		Scan(ltr).
		Find(ctx)
	if err != nil {
		return nil, err
	}

	return ltr.List(), nil
}

func groupNameChannel(n string) (group string, name string, channel kubepkg.Channel) {
	parts := strings.Split(n, "@")
	if len(parts) > 1 {
		_ = channel.UnmarshalText([]byte(parts[1]))
	}

	parts = strings.Split(parts[0], "/")
	group = parts[0]
	if len(parts) > 1 {
		name = parts[1]
	}

	return
}

func (r *KubepkgRepository) Latest(ctx context.Context, groupNameChannels []string) (map[string]*kubepkg.VersionInfo, error) {
	versions := map[string]*kubepkg.VersionInfo{}

	for i := range groupNameChannels {
		v := groupNameChannels[i]
		group, name, channel := groupNameChannel(v)

		if _, ok := versions[groupNameChannels[i]]; !ok {
			list, err := r.ListVersion(ctx, group, name, channel, nil, &datatypes.Pager{Size: 1})
			if err != nil {
				return nil, err
			}
			if len(list) > 0 {
				versions[v] = list[0]
			} else {
				versions[v] = &kubepkg.VersionInfo{}
			}
		}
	}

	return versions, nil
}

func (KubepkgRepository) ListVersion(
	ctx context.Context,
	group string, name string, channel kubepkg.Channel,
	where sqlbuilder.SqlCondition,
	pager *datatypes.Pager,
) ([]*kubepkg.VersionInfo, error) {
	if pager == nil {
		pager = &datatypes.Pager{}
	}
	pager.SetDefaults()

	if channel == kubepkg.CHANNEL_UNKNOWN {
		channel = kubepkg.CHANNEL__DEV
	}

	ltr := datatypes.NewLister(func(kk *kubepkg.Version) (*kubepkg.VersionInfo, error) {
		return &kubepkg.VersionInfo{
			Version:    kk.Version,
			RevisionID: kk.RevisionID,
		}, nil
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
		OrderBy(
			sqlbuilder.DescOrder(kubepkg.VersionT.Major),
			sqlbuilder.DescOrder(kubepkg.VersionT.Minor),
			sqlbuilder.DescOrder(kubepkg.VersionT.Patch),
			sqlbuilder.DescOrder(kubepkg.VersionT.Version),
		).
		Limit(pager.Size).Offset(pager.Offset).
		Scan(ltr).
		Find(ctx)
	if err != nil {
		return nil, err
	}

	return ltr.List(), nil
}

func (r KubepkgRepository) DeleteVersion(ctx context.Context, group string, name string, channel kubepkg.Channel, version string) error {
	return dal.Prepare(kubepkg.VersionT).ForDelete().
		Where(sqlbuilder.And(
			kubepkg.VersionT.Channel.V(sqlbuilder.Eq(channel)),
			kubepkg.VersionT.Version.V(sqlbuilder.Eq(version)),
			kubepkg.VersionT.KubepkgID.V(
				dal.InSelect(
					kubepkg.KubepkgT.ID,
					dal.From(kubepkg.KubepkgT).
						Where(
							sqlbuilder.And(
								kubepkg.KubepkgT.Group.V(sqlbuilder.Eq(group)),
								kubepkg.KubepkgT.Name.V(sqlbuilder.Eq(name)),
							),
						),
				),
			),
		)).
		Save(ctx)
}

func (r KubepkgRepository) PutVersion(ctx context.Context, group string, name string, channel kubepkg.Channel, info kubepkg.VersionInfo) error {
	k := kubepkg.Kubepkg{}

	err := dal.From(kubepkg.KubepkgT).
		Where(
			sqlbuilder.And(
				kubepkg.KubepkgT.Group.V(sqlbuilder.Eq(group)),
				kubepkg.KubepkgT.Name.V(sqlbuilder.Eq(name)),
			),
		).
		Scan(&k).
		Find(ctx)
	if err != nil {
		return err
	}

	kv := kubepkg.Version{}

	id, err := idgen.FromContextAndCast[datatypes.SFID](ctx).ID()
	if err != nil {
		return err
	}
	kv.ID = id
	kv.Channel = channel
	kv.KubepkgID = k.ID
	kv.Version = info.Version
	kv.RevisionID = info.RevisionID

	return dal.Prepare(&kv).
		OnConflict(kubepkg.VersionT.I.IVersion).DoNothing().
		Save(ctx)
}

func (r *KubepkgRepository) Get(ctx context.Context, group string, name string, channel kubepkg.Channel, id kubepkg.RevisionID) (*v1alpha1.KubePkg, error) {
	ltr := datatypes.NewLister(func(kk *struct {
		Version  kubepkg.Version
		Revision kubepkg.Revision
		Kubepkg  kubepkg.Kubepkg
	}) (*v1alpha1.KubePkg, error) {
		k := &v1alpha1.KubePkg{}
		k.SetGroupVersionKind(v1alpha1.SchemeGroupVersion.WithKind("KubePkg"))

		k.Name = kk.Kubepkg.Name

		if k.Annotations == nil {
			k.Annotations = map[string]string{}
		}

		if kk.Version.Channel == kubepkg.CHANNEL_UNKNOWN {
			kk.Version.Channel = kubepkg.CHANNEL__DEV
		}

		k.Annotations[kubepkg.AnnotationRevision] = kk.Revision.ID.String()
		k.Annotations[kubepkg.AnnotationName] = fmt.Sprintf("%s/%s", kk.Kubepkg.Group, kk.Kubepkg.Name)
		k.Annotations[kubepkg.AnnotationChannel] = kk.Version.Channel.String()

		k.Spec.Version = kk.Version.Version

		if err := json.Unmarshal(kk.Revision.Spec, &k.Spec); err != nil {
			return nil, errors.Wrap(err, "KubePkg unmarshal to json failed")
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
		Where(
			kubepkg.VersionT.RevisionID.V(sqlbuilder.Eq(id)),
		).
		Scan(ltr).
		Find(ctx)
	if err != nil {
		return nil, err
	}

	list := ltr.List()
	if len(list) == 0 {
		return nil, statuserror.Wrap(errors.New("NotFound"), http.StatusNotFound, "KubePkgNotFound")
	}

	return ltr.List()[0], nil
}
