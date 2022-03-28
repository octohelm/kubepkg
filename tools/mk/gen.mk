gen: gen-deepcopy

gen-deepcopy:
	deepcopy-gen \
		--output-file-base zz_generated.deepcopy \
		--go-header-file ./hack/boilerplate.go.txt \
		--input-dirs $(PKG)/pkg/apis/kubepkg/v1alpha1