package v1alpha1

import (
	"testing"

	"github.com/octohelm/kubepkg/internal/testingutil"
)

func TestEnvVarValueOrFrom(t *testing.T) {
	envVars := []string{
		`@secretKeyRef:{name:"xxx-config",key:"X"}`,
		`@configMapKeyRef:{name:"xxx-config",key:"X"}`,
		`@fieldRef:{fieldPath:"metadata.name"}`,
		`@resourceFieldRef:{resource:"limit.cpu"}`,
	}

	for i := range envVars {
		envVar := envVars[i]

		t.Run(envVar, func(t *testing.T) {
			e2 := EnvVarValueOrFrom{}
			err := e2.UnmarshalText([]byte(envVar))
			testingutil.Expect(t, err, testingutil.Be[error](nil))

			data, err := e2.MarshalText()
			testingutil.Expect(t, err, testingutil.Be[error](nil))
			testingutil.Expect(t, string(data), testingutil.Be(envVar))
		})
	}
}
