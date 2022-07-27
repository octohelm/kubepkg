
package kubepkg

import (
	"github.com/innoai-tech/runtime/cuepkg/kube"
)

#KubepkgOperator: kube.#App & {
	app: {
		name: string | *"kubepkg-operator"
	}
  
	config: "KUBEPKG_LOG_LEVEL": string | *"info"
  
	config: "KUBEPKG_LOG_FILTER": string | *"Always"
  
	config: "KUBEPKG_TRACE_COLLECTOR_ENDPOINT": string | *""
  
	config: "KUBEPKG_KUBECONFIG": string | *""
  
	config: "KUBEPKG_INTERNAL_HOST": string | *""
  
	config: "KUBEPKG_EXTERNAL_HOST": string | *""
  
	config: "KUBEPKG_ENABLE_HTTPS": string | *"false"
  
	config: "KUBEPKG_ENABLE_AUTO_INTERNAL_HOST": string | *"false"
  
	config: "KUBEPKG_WATCH_NAMESPACE": string | *""
  
	config: "KUBEPKG_METRICS_ADDR": string | *""
  
	config: "KUBEPKG_ENABLE_LEADER_ELECTION": string | *"false"
  
	containers: "kubepkg-operator": {
		image: {
			name: _ | *"ghcr.io/octohelm/kubepkg"
			tag:  _ | *"\(app.version)"
		}

		args: [
		"serve",		"operator",
		]
	}
}