package signer

import (
	"testing"
	"time"

	"github.com/octohelm/kubepkg/internal/testingutil"
	"github.com/octohelm/kubepkg/pkg/idgen"
)

func TestSigner(t *testing.T) {
	v := &struct {
		idgen.IDGen
		JWTSigner
	}{}

	ctx := testingutil.NewContext(t, v)

	t.Run("When sign a token", func(t *testing.T) {
		tokStr, _, err := v.Sign(ctx, 5*time.Second, "test", "account")
		testingutil.Expect(t, err, testingutil.Be[error](nil))

		t.Run("Could Validate", func(t *testing.T) {
			tok, err := v.Validate(ctx, tokStr)
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, tok.Subject(), testingutil.Be("test"))
		})
	})
}
