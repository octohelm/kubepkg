package ioutil

import (
	"os"
	"path/filepath"
)

func CreateOrOpen(name string) (*os.File, error) {
	if err := os.MkdirAll(filepath.Dir(name), os.ModePerm); err != nil {
		return nil, err
	}
	f, err := os.Create(name)
	if err != nil {
		if os.IsExist(err) {
			return os.Open(name)
		}
		return nil, err
	}
	return f, nil
}
