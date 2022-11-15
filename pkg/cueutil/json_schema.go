package cueutil

import (
	"encoding/json"

	"cuelang.org/go/cue"
	"cuelang.org/go/cue/cuecontext"
	"cuelang.org/go/encoding/openapi"
)

var pathToType = cue.MakePath(cue.Str("components"), cue.Str("schemas"), cue.Str("Type"))

func ConvertToJSONSchema(typeDef []byte) ([]byte, error) {
	ctx := cuecontext.New()

	value := cuecontext.New().CompileBytes(append([]byte("#Type:"), typeDef...))

	apiFile, err := openapi.Generate(value, &openapi.Config{})
	if err != nil {
		return nil, err
	}

	return json.Marshal(ctx.BuildFile(apiFile).LookupPath(pathToType))
}
