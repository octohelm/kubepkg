package kubepkg

#KubePkg: {
	apiVersion: "octohelm.tech/v1alpha1"
	kind:       "KubePkg"
}

#KubePkgList: {
	apiVersion: "octohelm.tech/v1alpha1"
	kind:       "KubePkgList"
	items: [...#KubePkg]
}
