export GIT_SHA ?= $(shell git rev-parse HEAD)
export GIT_REF ?= HEAD

DAGGER = dagger --log-format=plain

build:
	$(DAGGER) do build
.PHONY: build

push:
	$(DAGGER) do push
.PHONY: push

KUBEPKG = go run ./cmd/kubepkg
KUBECONFIG = ${HOME}/.kube_config/config--hw-test.yaml

test:
	go test -race -v ./pkg/...

install:
	go install ./cmd/kubepkg

serve.operator:
	$(KUBEPKG) \
		--internal-host="{{ .Name }}---{{ .Namespace }}.hw-test.innoai.tech" \
		--enable-https=true \
		--watch-namespace=default \
		--kubeconfig=$(KUBECONFIG) \
			serve operator

serve.agent:
	$(KUBEPKG) \
		--addr=:36060 \
		--storage-root=.tmp/kubepkg \
		--platform=linux/$(shell go env GOARCH) \
		--kubeconfig=$(KUBECONFIG) \
			serve agent

serve.registry:
	$(KUBEPKG) \
		--addr=:6060 \
		--storage-root=.tmp/kubepkg \
			serve registry

kubepkg.export:
	$(KUBEPKG) export -v=1 \
		--storage-root=.tmp/kubepkg \
		--platform=linux/amd64 \
		--extract-manifests-yaml=.tmp/manifests/demo.yaml \
 		--output=.tmp/demo.kube.tgz \
 			./testdata/demo.yaml

kubepkg.apply:
	$(KUBEPKG) apply --kubeconfig=$(KUBECONFIG) --force --dry-run ./testdata/demo.yaml

kubepkg.manifests:
	$(KUBEPKG) manifests ./testdata/demo.yaml

kubepkg.import:
	mkdir -p .tmp/manifests
	$(KUBEPKG) import -i=.tmp/kubepkg --manifest-output=.tmp/manifests .tmp/demo.kube.tgz

kubepkg.import.remote:
	@echo "incremental import with spec directly"
	$(KUBEPKG) import -i=http://0.0.0.0:36060 --incremental ./testdata/demo.yaml
	@echo "incremental import without debug"
	$(KUBEPKG) import -i=http://0.0.0.0:36060 --incremental .tmp/demo.kube.tgz
	@echo "incremental import with debug"
	$(KUBEPKG) import -v=1 -i=http://0.0.0.0:36060 --incremental .tmp/demo.kube.tgz
#	$(KUBEPKG) import -i=http://0.0.0.0:36060 .tmp/demo.kube.tgz

debug: kubepkg.export kubepkg.import

remote.debug: kubepkg.export remote.sync remote.ctr.import

remote.sync:
	scp .tmp/demo.kube.tgz root@crpe-test:/data/demo.kube.tgz

remote.ctr.import:
	@echo "if kube.pkg multi-arch supported --all-platforms is required"
	ssh root@crpe-test "gzip --decompress --stdout /data/demo.kube.tgz | ctr image import --all-platforms -"

gen: gen-deepcopy

gen-deepcopy:
	deepcopy-gen \
		--output-file-base zz_generated.deepcopy \
		--go-header-file ./hack/boilerplate.go.txt \
		--input-dirs $(PKG)/pkg/apis/kubepkg/v1alpha1

eval:
	cuem eval -o components.yaml ./cuepkg/kubepkg
