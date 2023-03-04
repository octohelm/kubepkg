package kubepkg

import (
	kubepkg "github.com/octohelm/kubepkg/cuepkg/kubepkg"
)

#KubepkgStorage: kubepkg.#Volume & {
	mountPath: "/etc/kubepkg"

	type: "PersistentVolumeClaim"
	opt: claimName: "storage-kubepkg"
	spec: {
		accessModes: ["ReadWriteOnce"]
		resources: requests: storage: "10Gi"
		storageClassName: "local-path"
	}
}

#KubepkgServiceAccount: kubepkg.#ServiceAccount & {
	scope: "Cluster"
	rules: [
		{
			apiGroups: ["*"]
			resources: ["*"]
			verbs: ["*"]
		},
		{
			nonResourceURLs: ["*"]
			verbs: ["*"]
		},
	]
}
