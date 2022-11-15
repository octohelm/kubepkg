package strfmt

import (
	"time"

	"k8s.io/kube-openapi/pkg/validation/strfmt"
)

type Duration time.Duration

func (d Duration) MarshalText() ([]byte, error) {
	return []byte(time.Duration(d).String()), nil
}

func (d *Duration) UnmarshalText(data []byte) error {
	dd, err := strfmt.ParseDuration(string(data))
	if err != nil {
		return err
	}
	*d = Duration(dd)
	return nil
}
