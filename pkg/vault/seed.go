package vault

import (
	"crypto/rand"
	"crypto/sha256"

	"golang.org/x/crypto/pbkdf2"
)

func NewSeed(password []byte, salt []byte, count int) *Seed {
	if len(password) == 0 {
		password = make([]byte, 32)
		_, _ = rand.Read(password)
	}
	return &Seed{Salt: salt, Password: password, Count: count}
}

type Seed struct {
	Password []byte
	Salt     []byte
	Count    int
}

func (s *Seed) ToCipher() Cipher {
	return NewCipher(pbkdf2.Key(s.Password, s.Salt, s.Count, 32, sha256.New))
}
