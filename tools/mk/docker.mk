DOCKER_FLAGS ?= --load
DOCKER_NAMESPACES ?= ghcr.io/octohelm
DOCKER_LABELS ?= \
	org.opencontainers.image.source=https://$(PKG) \
	org.opencontainers.image.version=$(VERSION) \
	org.opencontainers.image.revision=$(GIT_SHA)

pick_build_args = $(shell cat $1 | grep "^ARG " | sed -e 's/ARG \([^=]*\)\(.*\)/\1/g' | sed -e 's/\(TARGET\|BUILD\)\(PLATFORM\|OS\|ARCH\|VARIANT\)/ /g')

docker.build:
	@echo "for (${GIT_SHORT_SHA})${DOCKER_TAGS}"
	docker buildx build $(DOCKER_FLAGS) \
	  	$(foreach buildArg,$(call pick_build_args,cmd/$(TARGET_EXEC)/Dockerfile), --build-arg=$(buildArg)="$($(buildArg))") \
		$(foreach namespace,$(DOCKER_NAMESPACES),$(foreach tag,$(DOCKER_TAGS), --tag=$(namespace)/$(TARGET_EXEC):$(tag))) \
	  	$(foreach label,$(DOCKER_LABELS), --label=$(label)) \
		--file=cmd/$(TARGET_EXEC)/Dockerfile .

docker.push: DOCKER_FLAGS = $(foreach arch,$(TARGET_ARCH),--platform=linux/$(arch)) --push
docker.push: docker.build