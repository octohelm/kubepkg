package kubepkg

import (
	"github.com/innoai-tech/runtime/cuepkg/kube"
)



#Registry: kube.#App & {
	app: {
		name:    "container-registry"
		version: _ | *"latest"
	}

	config: {
		"KUBEPKG_REMOTE_REGISTRY_ENDPOINT": _ | *""
		"KUBEPKG_REMOTE_REGISTRY_USERNAME": _ | *""
		"KUBEPKG_REMOTE_REGISTRY_PASSWORD": _ | *""
	}

	services: "\(app.name)": {
		selector: "app": app.name
		clusterIP: *"10.68.0.255" | string
		ports:     containers."container-registry".ports
	}

	containers: "container-registry": {
		image: {
			name: _ | *"ghcr.io/octohelm/kubepkg"
			tag:  _ | *"\(app.version)"
		}
		args: ["serve", "registry"]
		ports: http: _ | *5000
		env: {
			"REGISTRY_ADDR": ":\(ports.http)"
		}
		readinessProbe: kube.#ProbeHttpGet & {
			httpGet: {path: "/", port: ports.http}
		}
		livenessProbe: readinessProbe
	}

	volumes: storage: #KubepkgStorage
}
