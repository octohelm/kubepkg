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

	t.Run("should generate rule", func(t *testing.T) {
		rules := p.
			For("test", "default").
			IngressRules(map[string]string{
				"http": "/",
			}, "public")

		testingutil.Expect(t, len(rules), testingutil.Be(2))
	})

	t.Run("should generate custom rule", func(t *testing.T) {
		rules := p.
			For("test", "default").
			IngressRules(map[string]string{
				"http": "/",
			}, "internal+http://test.internal")

		testingutil.Expect(t, rules[0].Host, testingutil.Be("test.internal"))
	})

}
