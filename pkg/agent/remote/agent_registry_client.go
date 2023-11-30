package remote

import (
	"bytes"
	"context"
	"encoding/base32"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"

	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/octohelm/kubepkg/pkg/agent"
	"github.com/octohelm/kubepkg/pkg/auth"
	"github.com/octohelm/kubepkg/pkg/datatypes"
	"github.com/octohelm/kubepkg/pkg/kubeutil/clusterinfo"
	"github.com/octohelm/kubepkg/pkg/serverinfo"
)

type AgentRegistryConnect struct {
	Endpoint datatypes.Endpoint `flag:",omitempty"`

	agent *agent.Agent
}

func (c *AgentRegistryConnect) Init(ctx context.Context) error {
	if !c.Endpoint.IsZero() {
		if err := c.tryRegister(ctx); err != nil {
			code := statuserror.FromErr(err).StatusCode()
			if code >= http.StatusBadRequest && code < http.StatusInternalServerError {
				return err
			}
		}
	} else {
		c.agent = &agent.Agent{}
	}
	if err := c.patchAgentInfo(ctx); err != nil {
		return err
	}
	return nil
}

func (c *AgentRegistryConnect) InjectContext(ctx context.Context) context.Context {
	return agent.WithContext(ctx, c.agent)
}

func (c *AgentRegistryConnect) patchAgentInfo(ctx context.Context) error {
	if c.agent != nil {
		e, ok := serverinfo.EndpointProviderFromContext(ctx).EndpointFor("root")
		if ok {
			for _, n := range clusterinfo.FromContext(ctx).Nodes {
				if n.Role == "control-plane" {
					if e.Hostname() != "127.0.0.1" {
						if externalIP := n.ExternalIP; externalIP != "" {
							port := e.Port()
							if port == "" {
								port = "80"
							}
							e.Host = fmt.Sprintf("%s:%s", externalIP, port)
						} else {
							if internalIP := n.InternalIP; internalIP != "" {
								port := e.Port()
								if port == "" {
									port = "80"
								}
								e.Host = fmt.Sprintf("%s:%s", internalIP, port)
							}
						}
					}

					c.agent.Endpoint = e.String()

					if c.agent.Name == "" {
						if hostname := n.Hostname; hostname != "" {
							c.agent.Name = hostname
						}
					}

					if c.agent.Time.IsZero() {
						c.agent.Time = datatypes.Datetime(time.Now())
					}

					if c.agent.OtpKeyURL == "" {
						k, _ := totp.Generate(totp.GenerateOpts{
							Issuer:      "agent.kubepkg.octohelm.com",
							AccountName: c.agent.Name,
							Period:      30,
							Algorithm:   otp.AlgorithmSHA1,
							Digits:      otp.DigitsSix,
							Secret:      []byte(base32.StdEncoding.EncodeToString([]byte(n.MachineID))),
						})

						c.agent.OtpKeyURL = k.URL()
					}
				}
			}
		}
	}

	return nil
}

func (c *AgentRegistryConnect) tryRegister(ctx context.Context) error {
	endpoint := (*url.URL)(&c.Endpoint)

	auths := auth.ParseAuthorization(endpoint.Query().Get("x-param-header-Authorization"))

	agentInfo, err := agent.ParseAgentToken(auths.Get("Bearer"))
	if err != nil {
		return err
	}
	c.agent = agentInfo

	if err := c.patchAgentInfo(ctx); err != nil {
		return err
	}

	b := bytes.NewBuffer(nil)

	if err := json.NewEncoder(b).Encode(c.agent); err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPut, endpoint.String(), b)
	if err != nil {
		return err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusOK && resp.StatusCode < http.StatusMultipleChoices {
		return nil
	}

	statusErr := &statuserror.StatusErr{}
	_ = json.NewDecoder(resp.Body).Decode(statusErr)
	return statusErr
}
