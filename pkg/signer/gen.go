package signer

import (
	"crypto/rand"
	"crypto/rsa"

	"github.com/lestrrat-go/jwx/v2/jwk"
)

func NewRSAPrimaryKeyREM() ([]byte, error) {
	pk, err := rsa.GenerateKey(rand.Reader, 1024)
	if err != nil {
		return nil, err
	}
	return jwk.EncodePEM(pk)
}
