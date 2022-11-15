package manifest

import (
	"strings"
	"testing"

	"github.com/octohelm/kubepkg/internal/testingutil"
)

func TestParseIngressGatewaySet(t *testing.T) {
	p, err := ParseIngressGatewaySet(strings.Join([]string{
		"public+https://{{ .Name }}.public",
		"internal+https://{{ .Name }}---{{ .Namespace }}.internal?always=true",
	}, ","))
	testingutil.Expect(t, err, testingutil.Be[error](nil))

	rules := p.
		For("test", "default").
		IngressRules(map[string]string{
			"http": "/",
		}, "public")

	testingutil.Expect(t, len(rules), testingutil.Be(2))
}
