package containerregistry

import (
	"context"
	"strings"

	"github.com/distribution/distribution/v3"
	"github.com/distribution/distribution/v3/reference"
)

type namespace struct {
	distribution.Namespace
	baseHost string
}

func (n namespace) Repository(ctx context.Context, named reference.Named) (distribution.Repository, error) {
	if n.baseHost != "" {
		if name := named.Name(); strings.HasPrefix(name, n.baseHost) {
			// <baseHost>/xxx/yyy => xxx/yyy
			fixedNamed, _ := reference.WithName(name[len(n.baseHost)+1:])
			return n.Namespace.Repository(ctx, fixedNamed)
		}
	}

	return n.Namespace.Repository(ctx, named)
}
