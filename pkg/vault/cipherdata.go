package vault

import (
	"bytes"
	"context"
	"crypto/aes"
	cryptocipher "crypto/cipher"
	"database/sql/driver"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"strings"
)

type OptCipher = func(c *CipherOpt)

type CipherOpt struct {
	Alg string `json:"alg"`
}

func WithAlg(alg string) OptCipher {
	return func(c *CipherOpt) {
		c.Alg = alg
	}
}

var (
	ErrInvalidCipherData = errors.New("invalid cipher data")
)

func ParseCipherData(data []byte) (*CipherData, error) {
	parts := bytes.Split(data, []byte("."))
	if len(parts) != 2 {
		return nil, ErrInvalidCipherData
	}

	d := json.NewDecoder(newBase64RawURLDecoder(parts[0]))
	cd := &CipherData{}
	if err := d.Decode(&cd.CipherOpt); err != nil {
		return nil, ErrInvalidCipherData
	}

	d2 := newBase64RawURLDecoder(parts[1])
	if _, err := io.Copy(cd, d2); err != nil {
		return nil, ErrInvalidCipherData
	}
	return cd, nil
}

func (cd *CipherData) EncodedBytes() []byte {
	buf := bytes.NewBuffer(nil)

	_ = base64RawURLEncodeTo(buf, func(w io.Writer) error {
		return json.NewEncoder(w).Encode(cd.CipherOpt)
	})

	buf.WriteByte('.')

	_ = base64RawURLEncodeTo(buf, func(w io.Writer) error {
		_, err := io.Copy(w, cd)
		return err
	})

	return buf.Bytes()
}

func newBase64RawURLDecoder(data []byte) io.Reader {
	return base64.NewDecoder(base64.RawURLEncoding, bytes.NewBuffer(data))
}

func base64RawURLEncodeTo(w io.Writer, writeTo func(w io.Writer) error) error {
	ew := base64.NewEncoder(base64.RawURLEncoding, w)
	defer ew.Close()
	err := writeTo(ew)
	return err
}

type CipherData struct {
	CipherOpt
	bytes.Buffer
}

func (CipherData) DataType(driver string) string {
	return "bytea"
}

func (cd CipherData) Value() (driver.Value, error) {
	return cd.EncodedBytes(), nil
}

func (cd *CipherData) Scan(src interface{}) error {
	c, err := ParseCipherData(src.([]byte))
	if err != nil {
		return err
	}
	*cd = *c
	return nil
}

type Cipher interface {
	Encrypt(ctx context.Context, data []byte, opts ...OptCipher) ([]byte, error)
	Decrypt(ctx context.Context, data []byte) ([]byte, error)
}

func NewCipher(key []byte) Cipher {
	return &cipher{Key: key}
}

type cipher struct {
	Key []byte
}

func (c *cipher) Decrypt(ctx context.Context, data []byte) ([]byte, error) {
	cd, err := ParseCipherData(data)
	if err != nil {
		return nil, err
	}
	return c.decrypt(cd)
}

func (c *cipher) Encrypt(ctx context.Context, data []byte, opts ...OptCipher) ([]byte, error) {
	cd, err := c.encrypt(data, opts...)
	if err != nil {
		return nil, err
	}
	return cd.EncodedBytes(), nil
}

func (c *cipher) encrypt(plaintext []byte, opts ...OptCipher) (*CipherData, error) {
	data := &CipherData{}

	for _, opt := range append([]OptCipher{WithAlg("aes-cfb")}, opts...) {
		opt(&data.CipherOpt)
	}

	stream, err := NewCipherStream(data.Alg, c.Key, false)
	if err != nil {
		return nil, err
	}

	if err := encrypt(data, bytes.NewBuffer(plaintext), stream); err != nil {
		return nil, err
	}

	return data, nil
}

func (c *cipher) decrypt(cipherData *CipherData) ([]byte, error) {
	stream, err := NewCipherStream(cipherData.Alg, c.Key, true)
	if err != nil {
		return nil, err
	}

	ret := bytes.NewBuffer(nil)

	if err := decrypt(ret, cipherData, stream); err != nil {
		return nil, err
	}

	return ret.Bytes(), nil
}

func NewCipherStream(alg string, key []byte, asDecrypt bool) (cryptocipher.Stream, error) {
	name, method, err := parseAlg(alg)
	if err != nil {
		return nil, err
	}

	cf, blockSize := cipherFuncByName(name)
	if cf == nil {
		return nil, fmt.Errorf("invalid alg %s", alg)
	}

	block, err := cf(key)
	if err != nil {
		return nil, err
	}

	iv := make([]byte, blockSize)

	switch method {
	case "cfb":
		if asDecrypt {
			return cryptocipher.NewCFBDecrypter(block, iv[:]), nil

		}
		return cryptocipher.NewCFBEncrypter(block, iv[:]), nil
	case "ofb":
		return cryptocipher.NewOFB(block, iv[:]), nil
	case "ctr":
		return cryptocipher.NewCTR(block, iv[:]), nil
	}

	return nil, fmt.Errorf("invalid alg %s", alg)
}

type cipherFunc = func(key []byte) (cryptocipher.Block, error)

var cipherFns = map[string]struct {
	cipherFunc cipherFunc
	blockSize  int
}{
	"aes": {
		aes.NewCipher,
		aes.BlockSize,
	},
}

func cipherFuncByName(name string) (cipherFunc, int) {
	if cf, ok := cipherFns[name]; ok {
		return cf.cipherFunc, cf.blockSize
	}
	return nil, 0
}

func parseAlg(alg string) (string, string, error) {
	parts := strings.Split(strings.ToLower(alg), "-")
	if len(parts) != 2 {
		return "", "", fmt.Errorf("invalid alg %s", alg)
	}
	return parts[0], parts[1], nil
}

func encrypt(w io.Writer, r io.Reader, stream cryptocipher.Stream) error {
	sw := &cryptocipher.StreamWriter{S: stream, W: w}
	defer sw.Close()
	_, err := io.Copy(sw, r)
	return err
}

func decrypt(w io.Writer, r io.Reader, stream cryptocipher.Stream) error {
	sr := &cryptocipher.StreamReader{S: stream, R: r}
	_, err := io.Copy(w, sr)
	if err != nil {
		return err
	}
	return nil
}
