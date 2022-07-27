package datatypes

import b "github.com/octohelm/storage/pkg/sqlbuilder"

func RightLikeOrIn[T ~string](values ...T) b.ColumnValueExpr[T] {
	if len(values) == 1 {
		return b.RightLike[T](values[0])
	}
	return b.In(values...)
}

func NewRecord[K comparable, T any]() Record[K, T] {
	return &record[K, T]{}
}

type Record[K comparable, T any] interface {
	Put(k K, v *T)
	Get(k K) *T
	Keys() []K
	Values() []*T
}

type record[K comparable, T any] struct {
	values []*T
	keys   []K
	m      map[K]*T
}

func (c *record[K, T]) Put(k K, v *T) {
	if c.m == nil {
		c.m = map[K]*T{}
	}
	c.m[k] = v
	c.values = append(c.values, v)
	c.keys = append(c.keys, k)
}

func (c *record[K, T]) Get(k K) *T {
	if c.m != nil {
		if v, ok := c.m[k]; ok {
			return v
		}
	}
	return nil
}

func (c *record[K, T]) Keys() []K {
	return c.keys
}

func (c *record[K, T]) Values() []*T {
	if c.values == nil {
		return make([]*T, 0)
	}
	return c.values
}
