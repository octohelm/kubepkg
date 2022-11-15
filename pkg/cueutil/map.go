package cueutil

import (
	"sync"
)

type Map[K any, V any] struct {
	m sync.Map
}

func (f *Map[K, V]) Load(k K) (V, bool) {
	if v, ok := f.m.Load(k); ok {
		return v.(V), ok
	}
	return *new(V), false
}

func (f *Map[K, V]) Store(k K, v V) {
	f.m.Store(k, v)
}
