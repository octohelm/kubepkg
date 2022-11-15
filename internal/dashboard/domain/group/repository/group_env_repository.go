package repository

import (
	"context"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/cluster"

	"github.com/octohelm/kubepkg/pkg/vault"

	"github.com/octohelm/kubepkg/pkg/idgen"
	"github.com/octohelm/storage/pkg/dal"

	"github.com/octohelm/storage/pkg/sqlbuilder"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
)

func NewGroupEnvRepository(g *group.Group) *GroupEnvRepository {
	return &GroupEnvRepository{
		Group: g,
	}
}

type GroupEnvRepository struct {
	Group *group.Group
}

func (r *GroupEnvRepository) Get(ctx context.Context, envName string) (*group.Env, error) {
	env := &group.Env{}

	err := dal.From(group.EnvT).
		Where(sqlbuilder.And(
			group.EnvT.GroupID.V(sqlbuilder.Eq(r.Group.ID)),
			group.EnvT.EnvName.V(sqlbuilder.Eq(envName)),
		)).
		Scan(env).
		Find(ctx)
	if err != nil {
		return nil, err
	}

	return env, nil
}

func (r *GroupEnvRepository) BindCluster(ctx context.Context, envName string, clusterID cluster.ID) (*group.Env, error) {
	env := &group.Env{}

	if err := dal.Prepare(env).
		ForUpdateSet(
			group.EnvT.ClusterID.By(sqlbuilder.Value(clusterID)),
		).
		Where(sqlbuilder.And(
			group.EnvT.GroupID.V(sqlbuilder.Eq(r.Group.ID)),
			group.EnvT.EnvName.V(sqlbuilder.Eq(envName)),
		)).
		Returning(
			group.EnvT.EnvID,
			group.EnvT.EnvName,
			group.EnvT.EnvType,
			group.EnvT.ClusterID,
			group.EnvT.Namespace,
			group.EnvT.CreatedAt,
			group.EnvT.UpdatedAt,
		).
		Scan(env).
		Save(ctx); err != nil {
		return nil, err
	}

	return env, nil
}

func (r *GroupEnvRepository) Put(ctx context.Context, envName string, info group.EnvInfo) (*group.Env, error) {
	env := &group.Env{}

	envID, err := idgen.FromContextAndCast[group.EnvID](ctx).ID()
	if err != nil {
		return nil, err
	}
	env.EnvID = envID
	env.EnvName = envName
	env.GroupID = r.Group.ID
	env.EnvInfo = info

	s := SeedForGroupEnv(env)

	env.RandPassword = s.Password

	err = dal.Prepare(env).
		OnConflict(group.EnvT.I.IEnvName).
		DoUpdateSet(
			group.EnvT.Desc,
			group.EnvT.EnvType,
		).
		Returning(
			group.EnvT.EnvID,
			group.EnvT.ClusterID,
			group.EnvT.Namespace,
			group.EnvT.CreatedAt,
			group.EnvT.UpdatedAt,
		).
		Scan(env).
		Save(ctx)
	if err != nil {
		return nil, err
	}

	return env, nil
}

func (repo *GroupEnvRepository) Delete(ctx context.Context, envName string) error {
	return dal.Prepare(group.EnvT).ForDelete().
		Where(sqlbuilder.And(
			group.EnvT.GroupID.V(sqlbuilder.Eq(repo.Group.ID)),
			group.EnvT.EnvName.V(sqlbuilder.Eq(envName)),
		)).
		Save(ctx)
}

func (repo *GroupEnvRepository) List(ctx context.Context, where sqlbuilder.SqlExpr) ([]group.Env, error) {
	list := make([]group.Env, 0)

	err := dal.From(group.EnvT).
		Where(sqlbuilder.And(
			group.EnvT.GroupID.V(sqlbuilder.Eq(repo.Group.ID)),
			where,
		)).
		Scan(&list).
		Find(ctx)
	if err != nil {
		return nil, err
	}

	return list, nil
}

func SeedForGroupEnv(env *group.Env) *vault.Seed {
	return vault.NewSeed(env.RandPassword, []byte(env.EnvID.String()), int(uint64(env.EnvID)%65535))
}
