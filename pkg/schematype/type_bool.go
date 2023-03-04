package schematype

import (
	"fmt"
	"io"
)

var _ Type = (*BoolType)(nil)

type BoolType struct {
}

func (BoolType) Kind() Kind {
	return Bool
}

func (BoolType) TypeDefTo(w io.Writer) {
	_, _ = fmt.Fprint(w, "bool")
}
