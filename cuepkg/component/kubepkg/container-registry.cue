package kubepkg

import (
	kubepkg "github.com/octohelm/kubepkg/cuepkg/kubepkg"
)

#ContainerRegistry: kubepkg.#KubePkg & {
	metadata: name: string | *"container-registry"
	spec: {
		version: _

		deploy: {
			kind: "Deployment"
			spec: replicas: _ | *1
		}

		config: KUBEPKG_LOG_LEVEL:                string | *"info"
		config: KUBEPKG_LOG_ASYNC:                string | *"false"
		config: KUBEPKG_LOG_FILTER:               string | *"Always"
		config: KUBEPKG_TRACE_COLLECTOR_ENDPOINT: string | *""
		config: KUBEPKG_STORAGE_ROOT:             string | *"/etc/kubepkg"
		config: KUBEPKG_REMOTE_REGISTRY_ENDPOINT: string | *""
		config: KUBEPKG_REMOTE_REGISTRY_USERNAME: string | *""
		config: KUBEPKG_REMOTE_REGISTRY_PASSWORD: string | *""

		services: "#": ports: containers."container-registry".ports

		containers: "container-registry": {

			ports: http: _ | *5000

			env: KUBEPKG_REGISTRY_ADDR: _ | *":\(ports."http")"

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

		containers: "container-registry": {
			image: {
				name: _ | *"ghcr.io/octohelm/kubepkg"
				tag:  _ | *"\(version)"
			}

			args: [
				"serve", "registry",
			]
		}
	}
}
