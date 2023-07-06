package agent

import (
	"testing"

	"github.com/octohelm/kubepkg/internal/testingutil"
	"github.com/octohelm/kubepkg/pkg/idgen"
	"github.com/octohelm/kubepkg/pkg/signer"
)

func TestRegistry(t *testing.T) {
	v := &struct {
		idgen.IDGen
		signer.JWTSigner
	}{}

	ctx := testingutil.NewContext(t, v)

	r := NewRegister()

	t.Run("setup flow", func(t *testing.T) {
		token, err := r.NewAccessToken(ctx, "10000")
		testingutil.Expect(t, err, testingutil.Be[error](nil))

		a, err := ParseAgentToken(token)
		testingutil.Expect(t, err, testingutil.Be[error](nil))

		err = r.Validate(ctx, a)
		testingutil.Expect(t, err, testingutil.Be[error](nil))

		t.Run("otp validate", func(t *testing.T) {
			passcode, now, err := a.GenerateOtp()
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			_, err = a.ValidateOtp(passcode, now)
			testingutil.Expect(t, err, testingutil.Be[error](nil))
		})
	})
}
