PKG = $(shell cat go.mod | grep "^module " | sed -e "s/module //g")
VERSION = $(shell cat internal/version/version)
COMMIT_SHA ?= $(shell git rev-parse --short HEAD)
TAG ?= $(VERSION)

TARGET ?= kubepkg
TARGET_PLATFORMS ?= $(GOOS)/amd64

GOOS ?= $(shell go env GOOS)
GOARCH ?= $(shell go env GOARCH)
GO_LDFLAGS ?= -trimpath -ldflags="-s -w -X $(PKG)/internal/version.Version=$(VERSION)+sha.$(COMMIT_SHA)"

KUBEPKG = go run $(GO_LDFLAGS) ./cmd/kubepkg

kubepkg.serve.operator:
	$(KUBEPKG) \
		--watch-namespace=default \
		--kubeconfig=${HOME}/.kube/config--crpe-test.yaml \
			serve operator

kubepkg.serve.agent:
	$(KUBEPKG) \
		--addr=:36060 \
		--storage-root=.tmp/kubepkg \
		--kubeconfig=${HOME}/.kube/config--crpe-test.yaml \
			serve agent

kubepkg.serve.registry:
	$(KUBEPKG) \
		--addr=:6060 \
		--storage-root=.tmp/kubepkg \
			serve registry

kubepkg: kubepkg.save kubepkg.import

kubepkg.save:
	$(KUBEPKG) save --storage-root=.tmp/kubepkg --platform=linux/amd64 --output=.tmp/demo.tgz ./testdata/demo.yaml

kubepkg.import:
	mkdir -p .tmp/manifests
	$(KUBEPKG) import --storage-root=.tmp/kubepkg .tmp/demo.tgz
	$(KUBEPKG) import --storage-root=.tmp/kubepkg -o=.tmp/manifests .tmp/demo.tgz

fmt:
	goimports -l -w .

dep:
	go get -u -t ./...

tidy:
	go mod tidy

build: GOOS = linux
build: tidy
	@$(foreach os,$(GOOS), \
		$(foreach arch,$(GOARCH), \
			$(MAKE) build.bin GOOS=$(os) GOARCH=$(arch) TARGET=$(TARGET); \
		)\
	)

build.bin:
	CGO_ENABLED=0 go build $(GO_LDFLAGS) \
		-o ./bin/$(TARGET)-$(GOOS)-$(GOARCH) ./cmd/$(TARGET)

DOCKER_NAMESPACES ?= ghcr.io/octohelm
DOCKER_LABELS ?= org.opencontainers.image.source=https://$(PKG) org.opencontainers.image.revision=$(COMMIT_SHA)
DOCKER_FLAGS ?=

docker: build
	docker buildx build \
		$(foreach label,$(DOCKER_LABELS),--label=$(label)) \
	  	$(foreach namespace,$(DOCKER_NAMESPACES),--tag=$(namespace)/$(TARGET):$(TAG)) \
	  	$(DOCKER_FLAGS) \
		--file=cmd/$(TARGET)/Dockerfile .

docker.push: DOCKER_FLAGS = $(foreach arch,$(GOARCH),--platform=linux/$(arch)) --push
docker.push: docker

gen: gen-deepcopy

gen-deepcopy:
	deepcopy-gen \
		--output-file-base zz_generated.deepcopy \
		--go-header-file ./hack/boilerplate.go.txt \
		--input-dirs $(PKG)/pkg/apis/kubepkg/v1alpha1
