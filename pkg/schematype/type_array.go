package schematype

import (
	"fmt"
	"io"
)

var _ Type = (*ArrayType)(nil)

type ArrayType struct {
	Elem Type
}

func (*ArrayType) Kind() Kind {
	return Array
}

func (t *ArrayType) TypeDefTo(w io.Writer) {
	_, _ = fmt.Fprint(w, "[...")
	t.Elem.TypeDefTo(w)
	_, _ = fmt.Fprint(w, "]")
}
