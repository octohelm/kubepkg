package schematype

import (
	"bytes"
	"testing"

	testingx "github.com/octohelm/x/testing"

	"github.com/octohelm/courier/pkg/openapi/jsonschema"
)

func TestTypeSystem(t *testing.T) {
	ts := NewTypeSystem()

	opts := &JSONSchemaOptions{
		Resolve: func(ref string) *jsonschema.Schema {
			switch ref {
			case "#/definitions/Obj":
				return jsonschema.ObjectOf(jsonschema.Props{
					"a": jsonschema.String(),
					"b": jsonschema.Boolean(),
				}, "a")
			}
			return nil
		},
	}

	cases := []struct {
		schema  *jsonschema.Schema
		typedef string
	}{
		{
			jsonschema.RefSchema("#/definitions/Obj"),
			"#Obj",
		},
		{
			jsonschema.String(),
			"string",
		},
		{
			jsonschema.Integer(),
			"int32",
		},
		{
			jsonschema.Boolean(),
			"bool",
		},
		{
			jsonschema.ItemsOf(jsonschema.String()),
			"[...string]",
		},
		{
			jsonschema.ObjectOf(jsonschema.Props{
				"a": jsonschema.String(),
				"b": jsonschema.Boolean(),
			}, "a"),
			`{
a: string
b?: bool
}`,
		},
		{
			jsonschema.MapOf(jsonschema.String()),
			"{ [X=string]: string }",
		},
		{
			jsonschema.OneOf(jsonschema.String(), jsonschema.Boolean()),
			"string | bool",
		},
		{
			jsonschema.AllOf(
				jsonschema.RefSchema("#/definitions/Obj"),
				jsonschema.ObjectOf(jsonschema.Props{
					"c": jsonschema.Integer(),
				}),
			),
			`{
#Obj
{
c?: int32
}
}`,
		},
	}

	for i := range cases {
		c := cases[i]

		t.Run(c.typedef, func(t *testing.T) {
			tpe := ts.FromJSONSchema(c.schema, opts)

			b := bytes.NewBuffer(nil)
			tpe.TypeDefTo(b)

			testingx.Expect(t, b.String(), testingx.Be(c.typedef))
		})
	}
}
