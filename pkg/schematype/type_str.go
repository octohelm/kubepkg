package schematype

import (
	"fmt"
	"io"
)

var _ Type = (*StringType)(nil)

type StringType struct {
	Format string
	Enum   []any
}

func (t *StringType) Kind() Kind {
	return String
}

func (t *StringType) TypeDefTo(w io.Writer) {
	if len(t.Enum) > 0 {
		for i := range t.Enum {
			if i > 0 {
				_, _ = fmt.Fprint(w, " | ")
			}
			_, _ = fmt.Fprintf(w, "%q", t.Enum[i])
		}
	} else {
		if t.Format == "bytes" {
			_, _ = fmt.Fprint(w, "bytes")
		} else {
			_, _ = fmt.Fprint(w, "string")
		}
	}
}
