package schematype

import (
	"bytes"
	"fmt"
	"io"
	"sort"
)

var _ Type = (*ObjectType)(nil)

type ObjectType struct {
	Embeds         []Type
	Props          map[string]Type
	Required       []string
	AdditionalProp Type
}

func (ObjectType) Kind() Kind {
	return Object
}

func (t *ObjectType) PropRequired(prop string) bool {
	for _, r := range t.Required {
		if r == prop {
			return true
		}
	}
	return false
}

func (t *ObjectType) TypeDefTo(w io.Writer) {
	embedsBuf := bytes.NewBuffer(nil)
	for i := range t.Embeds {
		if i > 0 {
			_, _ = fmt.Fprintln(embedsBuf)
		}
		t.Embeds[i].TypeDefTo(embedsBuf)
	}

	propsBuf := bytes.NewBuffer(nil)

	if len(t.Props) > 0 {
		propNames := make([]string, 0, len(t.Props))
		for n := range t.Props {
			propNames = append(propNames, n)
		}
		sort.Strings(propNames)

		for i, propName := range propNames {
			_, _ = fmt.Fprintln(propsBuf)

			_, _ = fmt.Fprint(propsBuf, propNames[i])
			if !t.PropRequired(propName) {
				_, _ = fmt.Fprint(propsBuf, "?")
			}

			_, _ = fmt.Fprint(propsBuf, ": ")
			t.Props[propName].TypeDefTo(propsBuf)
		}
	}

	if embedsBuf.Len() > 0 || propsBuf.Len() > 0 {
		if len(t.Embeds) == 1 && len(t.Props) == 0 {
			_, _ = io.Copy(w, embedsBuf)
			return
		}
		_, _ = fmt.Fprintf(w, "{")

		if embedsBuf.Len() > 0 {
			_, _ = fmt.Fprintln(w)
		}
		_, _ = io.Copy(w, embedsBuf)
		_, _ = io.Copy(w, propsBuf)

		_, _ = fmt.Fprintf(w, "\n}")

		return
	}

	_, _ = fmt.Fprint(w, "{ ")
	additionalProp := t.AdditionalProp
	if additionalProp == nil {
		additionalProp = &AnyType{}
	}
	_, _ = fmt.Fprint(w, "[X=string]: ")
	additionalProp.TypeDefTo(w)
	_, _ = fmt.Fprint(w, " }")

}
