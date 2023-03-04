package schematype

import (
	"fmt"
	"io"
)

var _ Type = (*AnyType)(nil)

type AnyType struct {
}

func (*AnyType) Kind() Kind {
	return Any
}

func (*AnyType) TypeDefTo(w io.Writer) {
	_, _ = fmt.Fprint(w, "_")
}
