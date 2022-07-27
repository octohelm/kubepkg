
package kubepkg

import (
	"github.com/innoai-tech/runtime/cuepkg/kube"
)

#KubepkgAgent: kube.#App & {
	app: {
		name: string | *"kubepkg-agent"
	}
  
	config: "KUBEPKG_LOG_LEVEL": string | *"info"
  
	config: "KUBEPKG_LOG_FILTER": string | *"Always"
  
	config: "KUBEPKG_TRACE_COLLECTOR_ENDPOINT": string | *""
  
	config: "KUBEPKG_KUBECONFIG": string | *""
  
	config: "KUBEPKG_STORAGE_ROOT": string | *"/etc/kubepkg"
  
	config: "KUBEPKG_AGENT_ID": string | *"dev"
  
	config: "KUBEPKG_PLATFORM": string | *"linux/amd64,linux/arm64"

	services: "\(app.name)": {
		selector: "app": app.name
		ports:     containers."kubepkg-agent".ports
	}

	containers: "kubepkg-agent": {

		ports: "http": _ | *36060

		env: "KUBEPKG_AGENT_ADDR": _ | *":\(ports."http")"

		readinessProbe: kube.#ProbeHttpGet & {
			httpGet: {path: "/", port: ports."http"}
		}
		livenessProbe: readinessProbe
  
	}
  
	containers: "kubepkg-agent": {
		image: {
			name: _ | *"ghcr.io/octohelm/kubepkg"
			tag:  _ | *"\(app.version)"
		}

		args: [
		"serve",		"agent",
		]
	}
}