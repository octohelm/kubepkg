package testingutil

import (
	"encoding/json"
	"os"
)

func PrintJSON(v any) {
	e := json.NewEncoder(os.Stdout)
	e.SetIndent("", "  ")
	_ = e.Encode(v)
}
