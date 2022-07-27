package kubepkg

import (
	"github.com/innoai-tech/runtime/cuepkg/kube"
)

#KubepkgOperator: kube.#App & {
	serviceAccount: #KubepkgServiceAccount
}

#ContainerRegistry: kube.#App & {
	app: _
	volumes: storage: #KubepkgStorage

	services: "\(app.name)": {
		clusterIP: *"10.68.0.255" | string
	}
}

#KubepkgAgent: kube.#App & {
	app: _

	services: "\(app.name)": {
		expose: {
			type: "NodePort"
		}
	}

	volumes: storage: #KubepkgStorage
	serviceAccount: #KubepkgServiceAccount
}
