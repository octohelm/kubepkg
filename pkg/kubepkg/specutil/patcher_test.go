package specutil

import (
	"testing"

	"github.com/octohelm/x/ptr"
	appsv1 "k8s.io/api/apps/v1"

	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"

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
			"X": "merged"
		}
	}
}
`,
		}

		k, err := ApplyOverwrites(kpkg2)
		testingx.Expect(t, err, testingx.Be[error](nil))
		testingx.Expect(t, k.Spec.Config["X"].Value, testingx.Be("merged"))
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
		testingx.Expect(t, k.Spec.Deploy.Deployer, testingx.Equal[v1alpha1.Deployer](&v1alpha1.DeployDeployment{
			Kind: "Deployment",
			Spec: appsv1.DeploymentSpec{
				Replicas: ptr.Ptr(int32(1)),
				Strategy: appsv1.DeploymentStrategy{
					Type: "Recreate",
				},
			},
		}))
	})

	t.Run("Should merge spec.containers", func(t *testing.T) {
		kpkg.Annotations = map[string]string{
			AnnotationOverwrites: `{
	"spec": {
		"containers": {
			"web": {
				"resources": {
				  "limits": {
					"aliyun.com/gpu-mem": "3",
					"cpu": "2",
					"memory": "4000Mi"
				  },
				  "requests": {
					"aliyun.com/gpu-mem": "3",
					"cpu": "100m",
					"memory": "100Mi"
				  }
				}
			}
		}
	}
}
`,
		}

		k, err := ApplyOverwrites(kpkg)
		testingx.Expect(t, err, testingx.Be[error](nil))

		testingx.Expect(t, k.Spec.Containers["web"], testingx.Equal(v1alpha1.Container{
			Image: v1alpha1.Image{
				Name:       "docker.io/library/nginx",
				Tag:        "alpine",
				PullPolicy: v1.PullIfNotPresent,
				Platforms: []string{
					"linux/amd64",
					"linux/arm64",
				},
			},
			Ports: map[string]int32{
				"http": 80,
			},
			Resources: &v1.ResourceRequirements{
				Limits: map[v1.ResourceName]resource.Quantity{
					"aliyun.com/gpu-mem": resource.MustParse("3"),
					"cpu":                resource.MustParse("2"),
					"memory":             resource.MustParse("4000Mi"),
				},
				Requests: map[v1.ResourceName]resource.Quantity{
					"aliyun.com/gpu-mem": resource.MustParse("3"),
					"cpu":                resource.MustParse("100m"),
					"memory":             resource.MustParse("100Mi"),
				},
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
      resources: 	
        limits: 	
          "aliyun.com/gpu-mem": "2"

  services:
    "#":
      ports:
        http: 80
`)
