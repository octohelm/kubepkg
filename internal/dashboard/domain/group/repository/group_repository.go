package repository

import (
	"context"

	"github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	"github.com/octohelm/kubepkg/pkg/idgen"
	"github.com/octohelm/storage/pkg/dal"
	"github.com/octohelm/storage/pkg/sqlbuilder"
)

const AdminGroupID = 10000

func AdminGroup() *group.Group {
	return &group.Group{
		ID:   AdminGroupID,
		Name: "ADMIN",
	}
}

func NewGroupRepository() *GroupRepository {
	return &GroupRepository{}
}

type GroupRepository struct {
}

func (GroupRepository) Put(ctx context.Context, name string, info group.Info) (*group.Group, error) {
	g := &group.Group{}

	groupID, err := idgen.FromContextAndCast[group.ID](ctx).ID()
	if err != nil {
		return nil, err
	}
	g.ID = groupID
	g.Name = name
	g.Info = info

	if err := dal.Prepare(g).
		OnConflict(group.GroupT.I.IGroupName).
		DoUpdateSet(
			group.GroupT.Desc,
		).
		Returning(
			group.GroupT.ID,
			group.GroupT.CreatedAt,
			group.GroupT.UpdatedAt,
		).
		Scan(g).Save(ctx); err != nil {
		return nil, err
	}

	return g, nil
}

func (GroupRepository) Get(ctx context.Context, name string) (*group.Group, error) {
	g := &group.Group{}

	err := dal.From(group.GroupT).
		Where(group.GroupT.Name.V(sqlbuilder.Eq(name))).
		Scan(g).
		Find(ctx)
	if err != nil {
		return nil, err
	}

	return g, nil
}

func (GroupRepository) Delete(ctx context.Context, name string) error {
	return dal.Prepare(group.GroupT).ForDelete().
		Where(group.GroupT.Name.V(sqlbuilder.Eq(name))).
		Save(ctx)
}

func (GroupRepository) List(ctx context.Context, where sqlbuilder.SqlExpr) ([]*group.Group, error) {
	list := make([]*group.Group, 0)

	err := dal.From(group.GroupT).
		Where(where).
		Scan(dal.Recv(func(g *group.Group) error {
			list = append(list, g)
			return nil
		})).
		Find(ctx)
	if err != nil {
		return nil, err
	}

	return list, nil
}
