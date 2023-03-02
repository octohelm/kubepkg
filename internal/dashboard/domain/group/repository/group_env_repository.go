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

func (r *GroupEnvRepository) Get(ctx context.Context, envName string) (*group.EnvWithCluster, error) {
	env := &group.EnvWithCluster{}

	err := dal.From(group.EnvT).
		Where(sqlbuilder.And(
			group.EnvT.GroupID.V(sqlbuilder.Eq(r.Group.ID)),
			group.EnvT.EnvName.V(sqlbuilder.Eq(envName)),
		)).
		Scan(&env.Env).
		Find(ctx)
	if err != nil {
		return nil, err
	}

	if env.ClusterID != 0 {
		env.Cluster = &cluster.Cluster{}
		if err := r.fillClusters(ctx, map[cluster.ID]*cluster.Cluster{
			env.ClusterID: env.Cluster,
		}); err != nil {
			return nil, err
		}
	}

	return env, nil
}

func (r *GroupEnvRepository) BindCluster(ctx context.Context, envName string, clusterID cluster.ID) (*group.EnvWithCluster, error) {
	env := &group.EnvWithCluster{}

	namespace := r.Group.Name
	if envName != "default" {
		namespace = namespace + "--" + envName
	}

	if err := dal.Prepare(&env.Env).
		ForUpdateSet(
			group.EnvT.ClusterID.By(sqlbuilder.Value(clusterID)),
			group.EnvT.Namespace.By(sqlbuilder.Value(namespace)),
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
		Scan(&env.Env).
		Save(ctx); err != nil {
		return nil, err
	}

	if env.ClusterID != 0 {
		env.Cluster = &cluster.Cluster{}
		if err := r.fillClusters(ctx, map[cluster.ID]*cluster.Cluster{
			env.ClusterID: env.Cluster,
		}); err != nil {
			return nil, err
		}
	}

	return env, nil
}

func (r *GroupEnvRepository) Put(ctx context.Context, envName string, info group.EnvInfo) (*group.EnvWithCluster, error) {
	envWithCluster := &group.EnvWithCluster{}

	envID, err := idgen.FromContextAndCast[group.EnvID](ctx).ID()
	if err != nil {
		return nil, err
	}
	envWithCluster.EnvID = envID
	envWithCluster.EnvName = envName
	envWithCluster.GroupID = r.Group.ID
	envWithCluster.EnvInfo = info

	s := SeedForGroupEnv(&envWithCluster.Env)

	envWithCluster.RandPassword = s.Password

	err = dal.Prepare(&envWithCluster.Env).
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
		Scan(&envWithCluster.Env).
		Save(ctx)
	if err != nil {
		return nil, err
	}

	if envWithCluster.ClusterID != 0 {
		if err := r.fillClusters(ctx, map[cluster.ID]*cluster.Cluster{
			envWithCluster.ClusterID: envWithCluster.Cluster,
		}); err != nil {
			return nil, err
		}
	}

	return envWithCluster, nil
}

func (repo *GroupEnvRepository) Delete(ctx context.Context, envName string) error {
	return dal.Prepare(group.EnvT).ForDelete().
		Where(sqlbuilder.And(
			group.EnvT.GroupID.V(sqlbuilder.Eq(repo.Group.ID)),
			group.EnvT.EnvName.V(sqlbuilder.Eq(envName)),
		)).
		Save(ctx)
}

func (repo *GroupEnvRepository) List(ctx context.Context, where sqlbuilder.SqlExpr) ([]*group.EnvWithCluster, error) {
	list := make([]*group.EnvWithCluster, 0)
	clusters := map[cluster.ID]*cluster.Cluster{}

	err := dal.From(group.EnvT).
		Where(sqlbuilder.And(
			group.EnvT.GroupID.V(sqlbuilder.Eq(repo.Group.ID)),
			where,
		)).
		OrderBy(sqlbuilder.AscOrder(group.EnvT.EnvName)).
		Scan(dal.Recv(func(v *group.EnvWithCluster) error {
			list = append(list, v)
			if v.ClusterID != 0 {
				c, ok := clusters[v.ClusterID]
				if !ok {
					c = &cluster.Cluster{}
					clusters[v.ClusterID] = c
				}
				v.Cluster = c
			}
			return nil
		})).
		Find(ctx)
	if err != nil {
		return nil, err
	}

	if err := repo.fillClusters(ctx, clusters); err != nil {
		return nil, err
	}

	return list, nil
}

func (repo *GroupEnvRepository) fillClusters(ctx context.Context, clusters map[cluster.ID]*cluster.Cluster) error {
	if n := len(clusters); n > 0 {
		clusterIDs := make([]cluster.ID, 0, n)
		for id := range clusters {
			clusterIDs = append(clusterIDs, id)
		}

		if err := dal.From(cluster.ClusterT).
			Where(cluster.ClusterT.ID.V(sqlbuilder.In(clusterIDs...))).
			Scan(dal.Recv(func(c *cluster.Cluster) error {
				*clusters[c.ID] = *c
				return nil
			})).
			Find(ctx); err != nil {
			return err
		}
	}

	return nil
}

func SeedForGroupEnv(env *group.Env) *vault.Seed {
	return vault.NewSeed(env.RandPassword, []byte(env.EnvID.String()), int(uint64(env.EnvID)%65535))
}
