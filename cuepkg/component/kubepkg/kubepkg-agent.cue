package kubepkg

import (
	kubepkg "github.com/octohelm/kubepkg/cuepkg/kubepkg"
)

#KubepkgAgent: kubepkg.#KubePkg & {
	metadata: {
		name: string | *"kubepkg-agent"
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
		config: "KUBEPKG_STORAGE_ROOT":             string | *"/etc/kubepkg"
		config: "KUBEPKG_AGENT_ID":                 string | *"dev"
		config: "KUBEPKG_PLATFORM":                 string | *"linux/amd64,linux/arm64"

		services: "#": {
			ports: containers."kubepkg-agent".ports
		}

		containers: "kubepkg-agent": {

			ports: "http": _ | *32060

			env: "KUBEPKG_AGENT_ADDR": _ | *":\(ports."http")"

			readinessProbe: {
				httpGet: {
					path:   "/"
					port:   ports."http"
					scheme: "HTTP"
				}
				initialDelaySeconds: _ | *5
				timeoutSeconds:      _ | *1
				periodSeconds:       _ | *10
				successThreshold:    _ | *1
				failureThreshold:    _ | *3
			}
			livenessProbe: readinessProbe
		}

		containers: "kubepkg-agent": {
			image: {
				name: _ | *"ghcr.io/octohelm/kubepkg"
				tag:  _ | *"\(version)"
			}

			args: [
				"serve", "agent",
			]
		}
	}
}
