package kubepkg

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"
	"sync"
	"testing"

	cueerrors "cuelang.org/go/cue/errors"
	cueformat "cuelang.org/go/cue/format"

	"github.com/octohelm/courier/pkg/openapi/jsonschema"
	"github.com/octohelm/courier/pkg/openapi/jsonschema/extractors"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/schematype"
	"sigs.k8s.io/yaml"
)

func TestCustomResourceDefinition(t *testing.T) {
	data, _ := yaml.Marshal(CRDs)
	_ = os.WriteFile("crd.yaml", data, 0644)
}

func TestCueify(t *testing.T) {
	schema := ExtractSchema(context.Background(), &v1alpha1.KubePkg{})
	data, _ := json.MarshalIndent(schema, "", "  ")
	_ = os.WriteFile("../../../cuepkg/kubepkg/schema.json", data, 0644)

	ts := schematype.NewTypeSystem()
	rootType := ts.FromJSONSchema(schema, &schematype.JSONSchemaOptions{
		Resolve: func(ref string) *jsonschema.Schema {
			parts := strings.Split(ref, "/")
			return schema.Definitions[parts[len(parts)-1]]
		},
	})

	ts.Defs["KubePkg"] = &schematype.NamedType{
		Name:       "KubePkg",
		Underlying: rootType,
	}

	b := bytes.NewBuffer(nil)
	_, _ = fmt.Fprintln(b, "package kubepkg")

	names := make([]string, 0, len(ts.Defs))
	for n := range ts.Defs {
		names = append(names, n)
	}
	sort.Strings(names)

	for _, n := range names {
		named := ts.Defs[n]

		_, _ = fmt.Fprintln(b)
		named.TypeDefTo(b)
		b.WriteString(": ")
		named.Underlying.TypeDefTo(b)
		_, _ = fmt.Fprintln(b)
	}

	data, err := cueformat.Source(b.Bytes(), cueformat.Simplify())
	if err != nil {
		cueerrors.Print(os.Stdout, err, nil)
		t.Error(err)
	}

	_ = os.WriteFile("../../../cuepkg/kubepkg/spec.cue", data, 0644)
}

func ExtractSchema(ctx context.Context, target any) *jsonschema.Schema {
	s := &jsonSchemaScanner{}
	return s.ExtractSchema(ctx, target)
}

type jsonSchemaScanner struct {
	definitions map[string]*jsonschema.Schema
	m           sync.Map
}

func (s *jsonSchemaScanner) ExtractSchema(ctx context.Context, target any) *jsonschema.Schema {
	schema := extractors.SchemaFrom(extractors.ContextWithSchemaRegister(ctx, s), target, true)
	schema.Definitions = map[string]*jsonschema.Schema{}

	for n, sub := range s.definitions {
		if schema != sub {
			schema.Definitions[n] = s.definitions[n]
		}
	}

	return schema
}

const schemaPathPrefix = "#/definitions/"

func (s *jsonSchemaScanner) Record(typeRef string) bool {
	_, ok := s.m.Load(typeRef)
	defer s.m.Store(typeRef, true)
	return ok
}

func (s *jsonSchemaScanner) RefString(ref string) string {
	parts := strings.Split(ref, ".")
	return fmt.Sprintf("%s%s", schemaPathPrefix, parts[len(parts)-1])
}

func (s *jsonSchemaScanner) RegisterSchema(ref string, schema *jsonschema.Schema) {
	if s.definitions == nil {
		s.definitions = map[string]*jsonschema.Schema{}
	}

	refName := strings.TrimPrefix(ref, schemaPathPrefix)

	if _, ok := s.definitions[refName]; ok {
		fmt.Printf("%s already defined\n", refName)
	} else {
		s.definitions[refName] = schema
	}
}
