package kubepkg

import (
	"github.com/innoai-tech/runtime/cuepkg/kube"
)

#Operator: kube.#App & {
	app: {
		name:    "kubepkg-operator"
		version: _ | *"latest"
	}

	containers: "kubepkg-operator": {
		image: {
			name: _ | *"ghcr.io/octohelm/kubepkg"
			tag:  _ | *"\(app.version)"
		}
		args: ["serve", "operator"]
	}

	serviceAccount: #KubepkgServiceAccount
}
