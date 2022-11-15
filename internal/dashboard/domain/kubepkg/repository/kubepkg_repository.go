package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/pkg/errors"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/datatypes"
	"github.com/octohelm/kubepkg/pkg/idgen"
	"github.com/octohelm/kubepkg/pkg/version/semver"
	"github.com/octohelm/storage/pkg/dal"
	"github.com/octohelm/storage/pkg/sqlbuilder"
	"github.com/opencontainers/go-digest"
)

func NewKubepkgRepository() *KubepkgRepository {
	return &KubepkgRepository{}
}

type KubepkgRepository struct {
}

func (r *KubepkgRepository) Put(ctx context.Context, k *v1alpha1.KubePkg) (*v1alpha1.KubePkg, *kubepkg.Ref, error) {
	kpkg := &kubepkg.Kubepkg{}
	kpkg.Group = k.Namespace
	kpkg.Name = k.Name

	revision := &kubepkg.Revision{}
	version := &kubepkg.Version{}
	version.Channel = kubepkg.CHANNEL__DEV
	version.Version = k.Spec.Version

	ref := &kubepkg.Ref{}

	if k.Annotations != nil {
		if c, ok := k.Annotations["kubepkg.innoai.tech/channel"]; ok {
			_ = version.Channel.UnmarshalText([]byte(c))
		}

		if n, ok := k.Annotations["kubepkg.innoai.tech/name"]; ok {
			parts := strings.Split(n, "/")
			if len(parts) == 2 {
				kpkg.Group = parts[0]
				kpkg.Name = parts[1]
			}
		}
	}

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
	version.ID = datatypes.SFID(id)
	revision.ID = kubepkg.RevisionID(id)

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
			OnConflict(kubepkg.RevisionT.I.IDigest).
			DoUpdateSet(
				kubepkg.RevisionT.KubepkgID,
			).
			Returning(
				kubepkg.RevisionT.ID,
				kubepkg.RevisionT.CreatedAt,
			).
			Scan(revision).
			Save(ctx)

		if err != nil {
			return err
		}

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

	if k.Annotations == nil {
		k.Annotations = map[string]string{}
	}

	k.Annotations["kubepkg.innoai.tech/name"] = fmt.Sprintf("%s/%s", kpkg.Group, kpkg.Name)
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

		k.Annotations["kubepkg.innoai.tech/revision"] = kk.Revision.ID.String()
		k.Annotations["kubepkg.innoai.tech/name"] = fmt.Sprintf("%s/%s", kk.Kubepkg.Group, kk.Kubepkg.Name)
		k.Annotations["kubepkg.innoai.tech/channel"] = kk.Version.Channel.String()

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
