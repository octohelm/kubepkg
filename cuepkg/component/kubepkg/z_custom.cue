package kubepkg

#KubepkgOperator: spec: {
	serviceAccount: #KubepkgServiceAccount
}

#ContainerRegistry: spec: {
	volumes: "~container-registry-storage": #KubepkgStorage
	services: "#": {
		//		clusterIP: *"10.68.0.255" | string
	}
}

#KubepkgAgent: spec: {
	services: "#": {
		expose: type: "NodePort"
	}
	volumes: "~container-registry-storage": #KubepkgStorage
	serviceAccount: #KubepkgServiceAccount
}
