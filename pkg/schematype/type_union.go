package schematype

import (
	"fmt"
	"io"
)

var _ Type = (*UnionType)(nil)

type UnionType struct {
	OneOf []Type
}

func (*UnionType) Kind() Kind {
	return Union
}

func (t *UnionType) TypeDefTo(w io.Writer) {
	for i := range t.OneOf {
		if i > 0 {
			_, _ = fmt.Fprint(w, " | ")
		}
		t.OneOf[i].TypeDefTo(w)
	}
}
