package cueutil

import (
	"context"
	"go/ast"
	"reflect"
	"strings"
)

type Field struct {
	Name      string
	Omitempty bool
	Tags      map[string][]string
	Type      reflect.Type
	Loc       []int
}

func (f *Field) From(v reflect.Value) (reflect.Value, bool) {
	if v.Kind() == reflect.Ptr && v.IsNil() {
		return reflect.Value{}, false
	}

	for _, i := range f.Loc {
		v = v.Field(i)
		if v.Kind() == reflect.Ptr && v.IsNil() {
			return reflect.Value{}, false
		}
	}

	return v, true
}

var structFields Map[reflect.Type, []Field]

func FieldIter(ctx context.Context, t reflect.Type) <-chan Field {
	fields, ok := structFields.Load(t)
	if !ok {
		var walkStruct func(f reflect.Type, loc ...int)
		walkStruct = func(f reflect.Type, loc ...int) {
			for i := 0; i < f.NumField(); i++ {
				ft := f.Field(i)

				if !ast.IsExported(ft.Name) {
					continue
				}

				inline := ft.Anonymous

				field := Field{
					Name: ft.Name,
					Type: ft.Type,
					Tags: map[string][]string{},
					Loc:  append(loc, i),
				}

				if jsonTag, ok := ft.Tag.Lookup("json"); ok {
					if jsonTag == "-" {
						continue
					}

					parts := strings.Split(jsonTag, ",")
					if n := parts[0]; n != "" {
						field.Name = n
					}
					field.Tags["json"] = parts

					if strings.Contains(jsonTag, ",omitempty") {
						field.Omitempty = true
					}

					if !strings.Contains(jsonTag, ",inline") {
						inline = false
					}
				}

				if inline {
					switch ft.Type.Kind() {
					case reflect.Struct:
						walkStruct(ft.Type, field.Loc...)
						continue
					case reflect.Ptr:
						if t := ft.Type.Elem(); t.Kind() == reflect.Struct {
							walkStruct(t, field.Loc...)
							continue
						}
					}
				}

				fields = append(fields, field)
			}
		}

		walkStruct(t)
	}

	ch := make(chan Field)

	go func(ctx context.Context, fields []Field) {
		defer close(ch)
		for i := range fields {
			select {
			case <-ctx.Done():
				return
			case ch <- fields[i]:
			}
		}
	}(ctx, fields)

	return ch
}
