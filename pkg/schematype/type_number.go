package schematype

import (
	"fmt"
	"io"
)

var _ Type = (*NumberType)(nil)

type NumberType struct {
	Format string
	Enum   []any
}

func (t *NumberType) Kind() Kind {
	return Number
}

func (t *NumberType) TypeDefTo(w io.Writer) {
	if len(t.Enum) > 0 {
		for i := range t.Enum {
			if i > 0 {
				_, _ = fmt.Fprint(w, " | ")
			}
			_, _ = fmt.Fprintf(w, "%v", t.Enum[i])
		}
	} else {
		switch t.Format {
		case "int8", "int16", "int32", "int64", "uint8", "uint16", "uint32", "uint64":
			_, _ = fmt.Fprint(w, t.Format)
		case "float32", "float64":
			_, _ = fmt.Fprint(w, t.Format)
		default:
			_, _ = fmt.Fprint(w, "int")
		}
	}
}
