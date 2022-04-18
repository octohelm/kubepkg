PKG = $(shell cat go.mod | grep "^module " | sed -e "s/module //g")
VERSION ?= $(shell cat internal/version/version)-dev

GIT_REF ?= HEAD
GIT_SHA ?= $(shell git rev-parse HEAD)
GIT_SHORT_SHA ?= $(shell echo $(GIT_SHA) | cut -c1-7)

DOCKER_TAGS ?= $(GIT_SHORT_SHA)

ifneq ( ,$(findstring /tags/,$(GIT_REF)))
  	VERSION = $(shell echo "$(GIT_REF)" | sed -e "s/refs\/tags\/v//")
  	DOCKER_TAGS = $(VERSION)
endif

TARGET_EXEC ?= kubepkg
TARGET_OS ?= $(shell go env GOOS)
TARGET_ARCH ?= $(shell go env GOARCH)