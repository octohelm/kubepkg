package main

import (
	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/innoai-tech/infra/pkg/otel"
	internalagent "github.com/octohelm/kubepkg/internal/agent"
	"github.com/octohelm/kubepkg/pkg/agent/remote"
	"github.com/octohelm/kubepkg/pkg/idgen"
	kubeutilclient "github.com/octohelm/kubepkg/pkg/kubeutil/client"
	"github.com/octohelm/kubepkg/pkg/kubeutil/clusterinfo"
	"github.com/octohelm/kubepkg/pkg/signer"
)

func init() {
	cli.AddTo(Serve, &Agent{})
}

// Serve kubepkg agent
type Agent struct {
	cli.C `component:"kubepkg-agent"`
	otel.Otel
	Metric otel.Metric

	idgen.IDGen

	Sign JWTSigner

	kubeutilclient.KubeClient
	clusterinfo.Provider

	internalagent.Server

	AgentRegistry remote.AgentRegistryConnect
}

type JWTSigner struct {
	signer.JWTSigner
}

func (s *JWTSigner) SetDefaults() {
	if s.Issuer == "" {
		s.Issuer = "agent.kubepkg.octohelm.tech"
	}
	s.JWTSigner.SetDefaults()
}
