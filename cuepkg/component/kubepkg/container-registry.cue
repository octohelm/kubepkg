
package kubepkg

import (
	"github.com/innoai-tech/runtime/cuepkg/kube"
)

#ContainerRegistry: kube.#App & {
	app: {
		name: string | *"container-registry"
	}
  
	config: "KUBEPKG_LOG_LEVEL": string | *"info"
  
	config: "KUBEPKG_LOG_FILTER": string | *"Always"
  
	config: "KUBEPKG_TRACE_COLLECTOR_ENDPOINT": string | *""
  
	config: "KUBEPKG_STORAGE_ROOT": string | *"/etc/kubepkg"
  
	config: "KUBEPKG_REMOTE_REGISTRY_ENDPOINT": string | *""
  
	config: "KUBEPKG_REMOTE_REGISTRY_USERNAME": string | *""
  
	config: "KUBEPKG_REMOTE_REGISTRY_PASSWORD": string | *""

	services: "\(app.name)": {
		selector: "app": app.name
		ports:     containers."container-registry".ports
	}

	containers: "container-registry": {

		ports: "http": _ | *5000

		env: "KUBEPKG_REGISTRY_ADDR": _ | *":\(ports."http")"

		readinessProbe: kube.#ProbeHttpGet & {
			httpGet: {path: "/", port: ports."http"}
		}
		livenessProbe: readinessProbe
  
	}
  
	containers: "container-registry": {
		image: {
			name: _ | *"ghcr.io/octohelm/kubepkg"
			tag:  _ | *"\(app.version)"
		}

		args: [
		"serve",		"registry",
		]
	}
}