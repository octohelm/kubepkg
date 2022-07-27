package datatypes

type Lister[T any, O any] interface {
	List() []*O
	New() any
	Next(v any) error
}

func NewLister[T any, O any](process func(i *T) (*O, error)) Lister[T, O] {
	return &lister[T, O]{
		process: process,
	}
}

type lister[T any, O any] struct {
	process func(i *T) (*O, error)
	list    []*O
}

func (lister[T, O]) New() any {
	return new(T)
}

func (l *lister[T, O]) Next(v any) error {
	if i, ok := v.(*T); ok {
		o, err := l.process(i)
		if err != nil {
			return err
		}
		l.list = append(l.list, o)
	}
	return nil
}

func (l *lister[T, O]) List() []*O {
	return l.list
}
