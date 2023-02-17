package util

import (
	"testing"

	testingx "github.com/octohelm/x/testing"
)

func TestBytesToString(t *testing.T) {
	testingx.Expect(t, StringToBytes("123"), testingx.Equal([]byte("123")))
	testingx.Expect(t, BytesToString([]byte("123")), testingx.Equal("123"))
}
