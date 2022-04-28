package manifest

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
)

func StringDataHash(inputs map[string]string) string {
	data, _ := json.Marshal(inputs)
	w := sha256.New()
	w.Write(data)
	return fmt.Sprintf("%x", w.Sum(nil))
}

func DataHash(inputs map[string][]byte) string {
	data, _ := json.Marshal(inputs)
	w := sha256.New()
	w.Write(data)
	return fmt.Sprintf("%x", w.Sum(nil))
}
