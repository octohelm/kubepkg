package cueutil

import (
	"cuelang.org/go/cue/cuecontext"
	cueparser "cuelang.org/go/cue/parser"
	"github.com/pkg/errors"
)

func Unmarshal(data []byte, v any) error {
	expr, err := cueparser.ParseFile("x.cue", data)
	if err != nil {
		return errors.Wrap(err, "parse fail")
	}
	cueValue := cuecontext.New().BuildFile(expr)
	return cueValue.Decode(v)
}
