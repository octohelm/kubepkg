package kubepkg

import (
	"github.com/innoai-tech/runtime/cuepkg/kube"
)

#KubepkgStorage: kube.#Volume & {
	mountPath: "/etc/kubepkg"
	source: {
		claimName: "storage-kubepkg"
		spec: {
			accessModes: ["ReadWriteOnce"]
			resources: requests: storage: "10Gi"
			storageClassName: "local-path"
		}
	}
}

#KubepkgServiceAccount: kube.#ServiceAccount &{
	role: "ClusterRole"
	rules: [
		{
			verbs: ["*"]
			apiGroups: ["*"]
			resources: ["*"]
		},
		{
			verbs: ["*"]
			nonResourceURLs: ["*"]
		},
	]
}
