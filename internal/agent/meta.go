package agent

import (
	"mime"
	"net/http"
	"strings"
)

var HEADER_KUBEPKG_AGENT = "X-Kubepkg-Server"

func agentMetaHandlerMiddleware(version string, a *Server) func(h http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
			rw.Header().Set(HEADER_KUBEPKG_AGENT, ToKubeAgentHead(&AgentInfo{
				AgentID:            a.AgentID,
				SupportedPlatforms: a.Platforms,

				Version: version,
			}))

			h.ServeHTTP(rw, req)
		})
	}
}

type AgentInfo struct {
	AgentID            string
	Version            string
	SupportedPlatforms []string
}

func FromKubeAgentHead(h string) (*AgentInfo, error) {
	base, params := parseValueAndParams(h)

	ai := &AgentInfo{
		AgentID: base,
	}

	if v, ok := params["version"]; ok {
		ai.Version = v
	}

	if v, ok := params["platforms"]; ok && v != "" {
		ai.SupportedPlatforms = strings.Split(v, ",")
	}

	return ai, nil
}

func ToKubeAgentHead(ai *AgentInfo) string {
	return mime.FormatMediaType(ai.AgentID, map[string]string{
		"platforms": strings.Join(ai.SupportedPlatforms, ","),
		"version":   ai.Version,
	})
}

func parseValueAndParams(h string) (string, map[string]string) {
	value, s, _ := strings.Cut(h, ";")
	if value == "" {
		return "", map[string]string{}
	}
	_, params, _ := mime.ParseMediaType("inline;" + s)
	return value, params
}
