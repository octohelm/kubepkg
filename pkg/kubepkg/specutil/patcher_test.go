package specutil

import (
	"testing"

	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	testingx "github.com/octohelm/x/testing"
)

func TestApplyOverwrites(t *testing.T) {
	kpkgs, err := kubepkg.LoadKubePkgs(kpkgYAML)
	testingx.Expect(t, err, testingx.Be[error](nil))

	kpkg := kpkgs[0]
	testingx.Expect(t, kpkg.Spec.Version, testingx.Be("v0.0.0"))

	t.Run("Should merge spec.config", func(t *testing.T) {
		kpkg2 := kpkg.DeepCopy()

		kpkg2.Annotations = map[string]string{
			AnnotationOverwrites: `{
	"spec": {
		"config": {
			"X": "x!"
		}
	}
}
`,
		}

		k, err := ApplyOverwrites(kpkg2)
		testingx.Expect(t, err, testingx.Be[error](nil))
		testingx.Expect(t, k.Spec.Config["X"].Value, testingx.Be("x!"))
	})

	t.Run("Should merge spec.deploy.spec", func(t *testing.T) {
		kpkg.Annotations = map[string]string{
			AnnotationOverwrites: `{
	"spec": {
		"deploy": {
			"spec": {
				"strategy": {
					"type": "Recreate"
				}
			}
		}
	}
}
`,
		}

		k, err := ApplyOverwrites(kpkg)
		testingx.Expect(t, err, testingx.Be[error](nil))
		testingx.Expect(t, k.Spec.Deploy.Spec, testingx.Equal(v1alpha1.SpecObject{
			"replicas": float64(1),
			"strategy": map[string]any{
				"type": "Recreate",
			},
		}))
	})
}

var kpkgYAML = []byte(`
apiVersion: octohelm.tech/v1alpha1
kind: KubePkg
metadata:
  name: demo
  namespace: default
spec:
  version: v0.0.0

  config:
    X: "x"

  deploy:
    kind: "Deployment"
    spec:
      replicas: 1

  containers:
    web:
      image:
        name: docker.io/library/nginx
        tag: alpine
        pullPolicy: IfNotPresent
        platforms:
          - linux/amd64
          - linux/arm64
      ports:
        http: 80

  services:
    "#":
      ports:
        http: 80
`)
