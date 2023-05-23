package util

import (
	"encoding/json"
	"io"
)

func DecodeTo(from any, to any) error {
	r, w := io.Pipe()
	e := json.NewEncoder(w)
	go func() {
		defer w.Close()
		_ = e.Encode(from)
	}()
	d := json.NewDecoder(r)
	if err := d.Decode(&to); err != nil {
		return err
	}
	return nil
}
