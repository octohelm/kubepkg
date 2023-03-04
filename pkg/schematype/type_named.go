package schematype

import (
	"fmt"
	"io"
)

var _ Type = (*NamedType)(nil)

type NamedType struct {
	Name       string
	Underlying Type
}

func (t *NamedType) Kind() Kind {
	return t.Underlying.Kind()
}

func (t *NamedType) TypeDefTo(w io.Writer) {
	_, _ = fmt.Fprint(w, "#")
	_, _ = fmt.Fprint(w, t.Name)
}
