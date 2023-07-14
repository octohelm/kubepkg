package kubepkg

#DefaultNodeSelector: {
	nodeSelector: {
		"node-role.kubernetes.io/master": "true"
	}
	tolerations: [
		{
			key:      "node-role.kubernetes.io/master"
			operator: "Exists"
			effect:   "NoSchedule"
		},
	]
}

#KubepkgOperator: spec: {
	serviceAccount: #KubepkgServiceAccount
	deploy: spec: template: spec: #DefaultNodeSelector
}

#ContainerRegistry: spec: {
	volumes: "~container-registry-storage": #KubepkgStorage
	services: "#": {
		//		clusterIP: *"10.68.0.255" | string
	}
	deploy: spec: template: spec: #DefaultNodeSelector
}
