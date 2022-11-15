package cueutil

import (
	"bytes"
	"context"
	"encoding"
	"fmt"
	"io"
	"reflect"
	"sort"

	"github.com/octohelm/storage/pkg/enumeration"
)

func EncodeType(v any) ([]byte, error) {
	buf := bytes.NewBuffer(nil)
	writeType(buf, reflect.TypeOf(v))
	return buf.Bytes(), nil
}

func Encode(v any) ([]byte, error) {
	buf := bytes.NewBuffer(nil)
	writeValue(buf, reflect.ValueOf(v))
	return buf.Bytes(), nil
}

func fprintf(w io.Writer, format string, args ...any) {
	if len(args) == 0 {
		_, _ = w.Write([]byte(format))
	} else {
		_, _ = fmt.Fprintf(w, format, args...)
	}
}

var typTextMarshaler = reflect.TypeOf((*encoding.TextMarshaler)(nil)).Elem()
var typCanEnumValues = reflect.TypeOf((*enumeration.CanEnumValues)(nil)).Elem()

func writeType(w io.Writer, t reflect.Type) {
	if t.Implements(typCanEnumValues) {
		canEnumValues := reflect.New(t).Interface().(enumeration.CanEnumValues)
		for i, v := range canEnumValues.EnumValues() {
			if i > 0 {
				fprintf(w, " | ")
			}
			writeValue(w, reflect.ValueOf(v))
		}
		return
	}
	if t.Implements(typTextMarshaler) {
		fprintf(w, "string")
		return
	}

	switch t.Kind() {
	case reflect.Ptr:
		writeType(w, t.Elem())
	case reflect.Interface:
		fprintf(w, "_") // any
	case reflect.Struct:
		fprintf(w, "{")
		idx := 0
		for f := range FieldIter(context.Background(), t) {
			if idx > 0 {
				fprintf(w, ",")
			}
			fprintf(w, f.Name)
			if f.Omitempty {
				fprintf(w, "?")
			}
			fprintf(w, ":")
			writeType(w, f.Type)
			idx++
		}
		fprintf(w, "}")
	case reflect.Map:
		fprintf(w, "[K=")
		writeType(w, t.Key())
		fprintf(w, "]:")
		writeType(w, t.Elem())
	case reflect.Slice:
		fprintf(w, "[...")
		writeType(w, t.Elem())
		fprintf(w, "]")
	default:
		fprintf(w, t.Kind().String())
	}
}

func writeValue(w io.Writer, rv reflect.Value) {
	t := rv.Type()

	if t.Implements(typTextMarshaler) {
		data, err := rv.Interface().(encoding.TextMarshaler).MarshalText()
		if err == nil {
			fprintf(w, "%q", string(data))
		} else {
			fprintf(w, "string")
		}
		return
	}

	switch rv.Kind() {
	case reflect.Ptr:
		if rv.IsNil() {
			return
		}
		writeValue(w, rv.Elem())
	case reflect.Struct:
		fprintf(w, "{")
		idx := 0
		for f := range FieldIter(context.Background(), rv.Type()) {
			v, ok := f.From(rv)
			if ok {
				isZeroValue := v.IsZero()

				if isZeroValue && f.Omitempty {
					continue
				}

				if idx > 0 {
					fprintf(w, ",")
				}

				fprintf(w, f.Name)
				fprintf(w, ":")

				if isZeroValue {
					writeType(w, v.Type())
				} else {
					writeValue(w, v)
				}

				idx++
			}
		}
		fprintf(w, "}")
	case reflect.Map:
		fprintf(w, "{")

		keys := rv.MapKeys()

		sort.Slice(keys, func(i, j int) bool {
			return keys[i].String() < keys[j].String()
		})

		for i, key := range keys {
			if i > 0 {
				fprintf(w, ",")
			}
			writeValue(w, key)
			fprintf(w, ":")
			writeValue(w, rv.MapIndex(key))
		}
		fprintf(w, "}")
	case reflect.Slice:
		fprintf(w, "[")
		for i := 0; i < rv.Len(); i++ {
			if i > 0 {
				fprintf(w, ",")
			}
			writeValue(w, rv.Index(i))
		}
		fprintf(w, "]")
	case reflect.String:
		fprintf(w, "%q", rv.Interface())
	default:
		fprintf(w, "%v", rv.Interface())
	}
}
