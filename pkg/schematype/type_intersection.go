package schematype

import (
	"fmt"
	"io"
)

var _ Type = (*IntersectionType)(nil)

type IntersectionType struct {
	AllOf []Type
}

func (*IntersectionType) Kind() Kind {
	return Intersection
}

func (t *IntersectionType) TypeDefTo(w io.Writer) {
	for i := range t.AllOf {
		if i > 0 {
			_, _ = fmt.Fprint(w, " & ")
		}
		t.AllOf[i].TypeDefTo(w)
	}
}
