GO_FLAGS ?= -trimpath -ldflags="-s -w -X $(PKG)/internal/version.Version=$(VERSION)+sha.$(GIT_SHORT_SHA)"
GO_RUN ?= go run $(GO_FLAGS) ./cmd/$(TARGET_EXEC)

go.xbuild:
	@$(foreach os,$(TARGET_OS), \
		$(foreach arch,$(TARGET_ARCH), \
			$(MAKE) go.build TARGET_OS=$(os) TARGET_ARCH=$(arch); \
		)\
	)

go.build:
	CGO_ENABLED=0 GOOS=$(TARGET_OS) GOARCH=$(TARGET_ARCH) \
		go build $(GO_FLAGS) -o ./bin/$(TARGET_EXEC)-$(TARGET_OS)-$(TARGET_ARCH) ./cmd/$(TARGET_EXEC)


go.install:
	CGO_ENABLED=0 GOOS=$(TARGET_OS) GOARCH=$(TARGET_ARCH) \
		go install $(GO_FLAGS) ./cmd/$(TARGET_EXEC)

go.fmt:
	goimports -l -w .

go.dep:
	go get -u -t ./...

go.tidy:
	go mod tidy
