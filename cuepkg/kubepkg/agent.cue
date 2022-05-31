package kubepkg

import (
	"github.com/innoai-tech/runtime/cuepkg/kube"
)

#Agent: kube.#App & {
	app: {
		name:    "kubepkg-agent"
		version: _ | *"latest"
	}

	services: "\(app.name)": {
		selector: "app": app.name

		ports: containers."kubepkg-agent".ports

		expose: {
			type: "NodePort"
		}
	}

	containers: "kubepkg-agent": {
		image: {
			name: _ | *"ghcr.io/octohelm/kubepkg"
			tag:  _ | *"\(app.version)"
		}
		args: ["serve", "agent"]
		ports: http: _ | *36060
		env: {
			"AGENT_ADDR": ":\(ports.http)"
		}
		readinessProbe: kube.#ProbeHttpGet & {
			httpGet: {path: "/", port: ports.http}
		}
		livenessProbe: readinessProbe
	}

	volumes: storage: #KubepkgStorage

	serviceAccount: #KubepkgServiceAccount
}
