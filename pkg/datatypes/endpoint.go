package datatypes

import "net/url"

// openapi:strfmt endpoint
type Endpoint url.URL

func (e *Endpoint) IsZero() bool {
	return e.Host == ""
}

func (e *Endpoint) ToURL() *url.URL {
	return (*url.URL)(e)
}

func (e *Endpoint) UnmarshalText(text []byte) error {
	u, err := url.Parse(string(text))
	if err != nil {
		return err
	}
	*e = *(*Endpoint)(u)
	return nil
}

func (e Endpoint) MarshalText() (text []byte, err error) {
	u := url.URL(e)
	return []byte((&u).String()), nil
}
