package agent

import (
	"context"
	"time"

	"github.com/octohelm/kubepkg/pkg/signer"
	"github.com/pkg/errors"
)

type Registry interface {
	NewAccessToken(ctx context.Context, name string) (string, error)
	Register(ctx context.Context, agent *Agent) error
}

func NewRegister() Registry {
	return &register{}
}

type register struct {
}

func (*register) NewAccessToken(ctx context.Context, name string) (string, error) {
	tokenStr, _, err := signer.FromContext(ctx).Sign(ctx, 90*24*time.Hour, "k8s-agent", name)
	if err != nil {
		return "", err
	}
	return tokenStr, nil
}

func (*register) Register(ctx context.Context, agent *Agent) error {
	t, err := signer.FromContext(ctx).Validate(ctx, agent.Token)
	if err != nil {
		return err
	}
	if t.Subject() != "k8s-agent" {
		return errors.New("invalid token")
	}
	return nil
}
