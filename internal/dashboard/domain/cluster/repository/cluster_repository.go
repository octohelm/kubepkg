package repository

import (
	"context"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/cluster"
	"github.com/octohelm/kubepkg/pkg/idgen"
	"github.com/octohelm/storage/pkg/dal"
	"github.com/octohelm/storage/pkg/sqlbuilder"
)

func NewClusterRepository() *ClusterRepository {
	return &ClusterRepository{}
}

type ClusterRepository struct {
}

func (ClusterRepository) Rename(ctx context.Context, oldName string, newName string) (*cluster.Cluster, error) {
	c := &cluster.Cluster{}
	c.Name = newName

	err := dal.Prepare(c).
		Where(sqlbuilder.And(
			cluster.ClusterT.ID.V(dal.InSelect(
				cluster.ClusterT.ID,
				dal.From(cluster.ClusterT).
					Where(cluster.ClusterT.Name.V(sqlbuilder.Eq(oldName))),
			)),
		)).
		Returning().Scan(&c).
		Save(ctx)
	if err != nil {
		return nil, err
	}

	return c, err
}

func (ClusterRepository) PutInfo(ctx context.Context, name string, info cluster.Info) (*cluster.Cluster, error) {
	c := &cluster.Cluster{}

	clusterID, err := idgen.FromContextAndCast[cluster.ID](ctx).ID()
	if err != nil {
		return nil, err
	}
	c.ID = clusterID
	c.Name = name
	c.Info = info

	if err := dal.Prepare(c).
		OnConflict(cluster.ClusterT.I.IName).
		DoUpdateSet(
			cluster.ClusterT.Desc,
			cluster.ClusterT.EnvType,
		).
		Returning(
			cluster.ClusterT.ID,
			cluster.ClusterT.NetType,
			cluster.ClusterT.AgentInfo,
			cluster.ClusterT.CreatedAt,
			cluster.ClusterT.UpdatedAt,
		).
		Scan(c).Save(ctx); err != nil {
		return nil, err
	}

	return c, nil
}

func (ClusterRepository) PutAgentInfo(ctx context.Context, name string, agentInfo cluster.AgentInfo, agentSecureInfo cluster.AgentSecureInfo) (*cluster.Cluster, error) {
	c := &cluster.Cluster{}

	clusterID, err := idgen.FromContextAndCast[cluster.ID](ctx).ID()
	if err != nil {
		return nil, err
	}
	c.ID = clusterID
	c.Name = name
	c.AgentInfo = agentInfo
	c.AgentSecureInfo = agentSecureInfo
	// when some agent update, it means could direct access
	c.NetType = cluster.NET_TYPE__DIRECT

	if err := dal.Prepare(c).
		OnConflict(cluster.ClusterT.I.IName).
		DoUpdateSet(
			cluster.ClusterT.Desc,
			cluster.ClusterT.EnvType,
			cluster.ClusterT.NetType,
			cluster.ClusterT.AgentInfo,
			cluster.ClusterT.AgentSecureInfo,
		).
		Returning(
			cluster.ClusterT.ID,
			cluster.ClusterT.CreatedAt,
			cluster.ClusterT.UpdatedAt,
		).
		Scan(c).Save(ctx); err != nil {
		return nil, err
	}

	return c, nil
}

func (ClusterRepository) Delete(ctx context.Context, name string) error {
	return dal.Prepare(cluster.ClusterT).ForDelete().
		Where(cluster.ClusterT.Name.V(sqlbuilder.Eq(name))).
		Save(ctx)
}

func (ClusterRepository) Get(ctx context.Context, nameOrID string) (*cluster.Cluster, error) {
	c := &cluster.Cluster{}
	_ = c.ID.UnmarshalText([]byte(nameOrID))

	var where sqlbuilder.SqlExpr

	if c.ID != 0 {
		where = cluster.ClusterT.ID.V(sqlbuilder.Eq(c.ID))
	} else {
		where = cluster.ClusterT.Name.V(sqlbuilder.Eq(nameOrID))
	}

	if err := dal.From(cluster.ClusterT).
		Where(where).
		Scan(c).
		Find(ctx); err != nil {
		return nil, err
	}

	return c, nil
}

func (ClusterRepository) List(ctx context.Context, where sqlbuilder.SqlExpr) ([]*cluster.Cluster, error) {
	list := make([]*cluster.Cluster, 0)

	err := dal.From(cluster.ClusterT).
		Where(where).
		Scan(dal.Recv(func(c *cluster.Cluster) error {
			list = append(list, c)
			return nil
		})).
		Find(ctx)
	if err != nil {
		return nil, err
	}

	return list, nil
}
