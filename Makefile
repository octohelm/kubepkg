PKG = $(shell cat go.mod | grep "^module " | sed -e "s/module //g")
VERSION = $(shell cat internal/version/version)
COMMIT_SHA ?= $(shell git rev-parse --short HEAD)
TAG ?= $(VERSION)

TARGET ?= kubepkg-operator
TARGET_PLATFORMS ?= $(GOOS)/amd64

GOOS ?= $(shell go env GOOS)
GOARCH ?= $(shell go env GOARCH)
GO_LDFLAGS ?= -trimpath -ldflags="-s -w -X $(PKG)/pkg/version.Version=$(VERSION)+sha.$(COMMIT_SHA)"

STORAGE_ROOT ?= .tmp/crpe

up: gen
	STORAGE_ROOT=$(STORAGE_ROOT) \
		go run ./cmd/$(TARGET) --kubeconfig=${HOME}/.kube/config--crpe-test.yaml

up.container-registry: TARGET = container-registry
up.container-registry: up

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
