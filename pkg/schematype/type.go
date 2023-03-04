package schematype

import (
	"io"
)

type Type interface {
	Kind() Kind
	TypeDefTo(w io.Writer)
}

type Kind int

const (
	Unknown Kind = iota
	Any
	String
	Number
	Bool
	Object
	Array
	Union
	Intersection
	Ref
)
