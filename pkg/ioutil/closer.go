package ioutil

import "io"

func NewCloser(close func() error) io.Closer {
	return &closer{close}
}

type closer struct {
	close func() error
}

func (c *closer) Close() error {
	return c.close()
}
