package schematype

import (
	"strings"

	"github.com/octohelm/courier/pkg/openapi/jsonschema"
	"github.com/pkg/errors"
)

func NewTypeSystem() *TypeSystem {
	return &TypeSystem{Defs: map[string]*NamedType{}}
}

type TypeSystem struct {
	Defs map[string]*NamedType
}

type JSONSchemaOptions struct {
	Resolve func(ref string) *jsonschema.Schema
}

func (ts *TypeSystem) FromJSONSchema(schema *jsonschema.Schema, opts *JSONSchemaOptions) (tpe Type) {
	if schema == nil {
		return &AnyType{}
	}

	if schema.Refer != nil {
		ref := schema.Refer.RefString()
		parts := strings.Split(schema.Refer.RefString(), "/")
		name := parts[len(parts)-1]

		named := &NamedType{Name: name}
		ts.Defs[named.Name] = named

		if opts == nil {
			panic(errors.New("missing opts"))
		}

		named.Underlying = ts.FromJSONSchema(opts.Resolve(ref), opts)

		return named
	}

	if n := len(schema.AllOf); n > 0 {
		isObjectAllOf := false
		types := make([]Type, 0, len(schema.AllOf))

		for i := range schema.AllOf {
			t := ts.FromJSONSchema(schema.AllOf[i], opts)
			if t.Kind() == Object {
				isObjectAllOf = true
			}
			if t.Kind() != Any {
				types = append(types, t)
			}
		}

		if isObjectAllOf {
			return &ObjectType{
				Embeds: types,
			}
		}

		if len(types) > 0 {
			return &IntersectionType{
				AllOf: types,
			}
		}

		return &AnyType{}
	}

	if n := len(schema.OneOf); n > 0 {
		u := &UnionType{
			OneOf: make([]Type, n),
		}

		for i := range schema.OneOf {
			u.OneOf[i] = ts.FromJSONSchema(schema.OneOf[i], opts)
		}

		return u
	}

	if n := len(schema.Type); n > 1 {
		u := &UnionType{
			OneOf: make([]Type, n),
		}

		for i := range u.OneOf {
			u.OneOf[i] = ts.FromJSONSchema(&jsonschema.Schema{
				SchemaBasic: jsonschema.SchemaBasic{
					Type: []string{schema.Type[i]},
				},
			}, opts)
		}

		return u
	}

	if len(schema.Type) > 0 {

		switch schema.Type[0] {
		case "boolean":
			return &BoolType{}
		case "string":
			return &StringType{
				Format: schema.Format,
				Enum:   schema.Enum,
			}
		case "integer", "number":
			return &NumberType{
				Format: schema.Format,
				Enum:   schema.Enum,
			}
		case "array":
			// FIXME handle items as array
			return &ArrayType{
				Elem: ts.FromJSONSchema(schema.Items.Schema, opts),
			}
		case "object":
			o := &ObjectType{
				Required: schema.Required,
			}

			if schema.Properties != nil {
				o.Props = map[string]Type{}

				for name := range schema.Properties {
					o.Props[name] = ts.FromJSONSchema(schema.Properties[name], opts)
				}
			}

			if schema.AdditionalProperties != nil {
				if schema.AdditionalProperties.Schema != nil {
					o.AdditionalProp = ts.FromJSONSchema(schema.AdditionalProperties.Schema, opts)
				} else if schema.AdditionalProperties.Allows {
					o.AdditionalProp = &AnyType{}
				}
			}

			return o
		}
	}

	if len(schema.Enum) > 0 {
		switch schema.Enum[0].(type) {
		case string:
			return &StringType{Enum: schema.Enum}
		case float64:
			return &NumberType{Enum: schema.Enum}
		}
	}

	return &AnyType{}
}
