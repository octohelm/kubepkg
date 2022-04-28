package mime

import (
	"mime"
	"testing"
)

func TestDigestMetaType(t *testing.T) {
	t.Run("x", func(t *testing.T) {
		t.Log(mime.TypeByExtension(".tar"))
	})
}
