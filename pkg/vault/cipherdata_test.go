package vault

import (
	"context"
	"strings"
	"testing"

	"github.com/octohelm/kubepkg/internal/testingutil"
)

func TestCipher(t *testing.T) {
	seed := NewSeed(nil, nil, 65535)

	algs := []string{"aes-cfb", "aes-ctr", "aes-ofb"}

	for i := range algs {
		t.Run("Encrypt", func(t *testing.T) {
			c := seed.ToCipher()

			v := strings.Repeat("z", 1000)

			d, err := c.Encrypt(context.Background(), []byte(v), WithAlg(algs[i]))
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			t.Log(string(d))

			t.Run("Decrypt", func(t *testing.T) {
				plaintext, err := c.Decrypt(context.Background(), d)
				testingutil.Expect(t, err, testingutil.Be[error](nil))
				testingutil.Expect(t, string(plaintext), testingutil.Equal(v))
			})
		})
	}

}
