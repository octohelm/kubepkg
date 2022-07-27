package idgen

import (
	"context"
	"time"

	"github.com/go-courier/snowflakeid"
	"github.com/go-courier/snowflakeid/workeridutil"
)

var startTime, _ = time.Parse(time.RFC3339, "2020-01-01T00:00:00Z")
var sff = snowflakeid.NewSnowflakeFactory(16, 8, 5, startTime)

func New() (Gen, error) {
	return sff.NewSnowflake(workeridutil.WorkerIDFromIP(ResolveExposedIP()))
}

type Gen interface {
	ID() (uint64, error)
}

type TypedGen[ID ~uint64] interface {
	ID() (ID, error)
}

func Cast[ID ~uint64](gen Gen) TypedGen[ID] {
	return &typedGen[ID]{g: gen}
}

type typedGen[ID ~uint64] struct {
	g Gen
}

func (t *typedGen[ID]) ID() (ID, error) {
	u, err := t.g.ID()
	if err != nil {
		return 0, err
	}
	return ID(u), nil
}

type IDGen struct {
	g Gen
}

func (i *IDGen) Init(ctx context.Context) error {
	g, err := New()
	if err != nil {
		return err
	}
	i.g = g
	return nil
}

func (i *IDGen) InjectContext(ctx context.Context) context.Context {
	return InjectContext(ctx, i.g)
}
