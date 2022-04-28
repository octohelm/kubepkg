package testutil

import (
	"github.com/smartystreets/goconvey/convey"
	"testing"
)

func WithT(action func()) func(t *testing.T) {
	return func(t *testing.T) {
		convey.Convey(t.Name(), t, action)
	}
}

func It(desc string, action func()) {
	convey.Convey(desc, action)
}

func ItSkip(desc string, action func()) {
	convey.SkipConvey(desc, action)
}

var So = convey.So
