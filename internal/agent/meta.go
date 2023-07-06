package agent

import (
	"mime"
	"strings"
)

var HEADER_KUBEPKG_AGENT = "X-Kubepkg-Server"

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
