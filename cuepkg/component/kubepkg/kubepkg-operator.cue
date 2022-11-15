package kubepkg

import (
	kubepkg "github.com/octohelm/kubepkg/cuepkg/kubepkg:v1alpha1"
)

#KubepkgOperator: kubepkg.#KubePkg & {
	metadata: {
		name: string | *"kubepkg-operator"
	}
	spec: {
		version: _

		deploy: {
			kind: "Deployment"
			spec: replicas: _ | *1
		}

		config: "KUBEPKG_LOG_LEVEL":                string | *"info"
		config: "KUBEPKG_LOG_FILTER":               string | *"Always"
		config: "KUBEPKG_TRACE_COLLECTOR_ENDPOINT": string | *""
		config: "KUBEPKG_KUBECONFIG":               string | *""
		config: "KUBEPKG_INGRESS_GATEWAY":          string | *""
		config: "KUBEPKG_WATCH_NAMESPACE":          string | *""
		config: "KUBEPKG_METRICS_ADDR":             string | *""
		config: "KUBEPKG_ENABLE_LEADER_ELECTION":   string | *"false"

		containers: "kubepkg-operator": {
			image: {
				name: _ | *"ghcr.io/octohelm/kubepkg"
				tag:  _ | *"\(version)"
			}

			args: [
				"serve", "operator",
			]
		}
	}
}
