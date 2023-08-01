ARCH=$(shell go env GOARCH)
WAGON = wagon -p wagon.cue
KUBECONFIG = ${HOME}/.kube/config
KUBEPKG = go run ./cmd/kubepkg

DEBUG = 0
ifeq ($(DEBUG),1)
	WAGON := $(WAGON) --log-level=debug
endif

ifneq ( ,$(wildcard .secrets/local.mk))
	include .secrets/local.mk
endif

gen:
	go run ./tool/internal/cmd/tool gen ./cmd/kubepkg

test:
	CI=true go test -v ./pkg/...
	CI=true go test -v ./internal/...

install:
	go install ./cmd/kubepkg

k.k8s:
	$(KUBEPKG) serve registry --dump-k8s
	$(KUBEPKG) serve operator --dump-k8s
	$(KUBEPKG) serve dashboard --dump-k8s

k.dashboard:
	$(KUBEPKG) serve dashboard --log-level=debug -c \
	  	--db-enable-migrate \
		--addr=0.0.0.0:8081 \
 		--auth-provider-oidc-endpoint=${OIDC_PROVIDER}

k.operator:
	$(KUBEPKG) \
		--ingress-gateway="public+https://{{ .Name }}---{{ .Namespace }}.public" \
		--ingress-gateway="internal+https://{{ .Name }}---{{ .Namespace }}.local?always=true" \
		--watch-namespace=default \
		--kubeconfig=$(KUBECONFIG) \
			serve operator

k.agent:
	$(KUBEPKG) \
		--storage-root=.tmp/kubepkg \
		--addr=127.0.0.1:32060 \
		--kubeconfig=$(KUBECONFIG) \
			-c serve agent

k.registry:
	$(KUBEPKG) \
		--registry-addr=:6060 \
		--storage-root=.tmp/kubepkg \
			serve registry

k.upload:
	$(KUBEPKG) upload \
			--output-manifests=.tmp/manifests/demo.manifests.yaml \
			--registry-endpoint=https://${CONTAINER_REGISTRY} \
			--registry-username=${CONTAINER_REGISTRY_USERNAME} \
			--registry-password=${CONTAINER_REGISTRY_PASSWORD} \
				./.tmp/demo-0.0.2-linux-arm64.kube.tar

PASSCODE =

k.upload.agent:
	$(KUBEPKG) upload \
			--registry-endpoint=http://127.0.0.1:32060 \
			--registry-username=otp \
			--registry-password=${PASSCODE} \
			--keep-origin-host=true \
				./.tmp/demo-0.0.2-linux-arm64.kube.tar

k.export:
	$(KUBEPKG) export \
		--log-level=debug \
 		--output-oci=.tmp/demo.airgap.tar \
		--storage-root=.tmp/kubepkg \
		--platform=linux/$(ARCH) \
 			./testdata/demo.yaml

k.export.patch:
	$(KUBEPKG) export \
		--log-level=debug \
 		--output-oci=.tmp/demo.diff.airgap.tar \
		--storage-root=.tmp/kubepkg \
		--platform=linux/$(ARCH) \
		--since=./testdata/demo.previous.yaml \
 			./testdata/demo.yaml

k.export.list:
	$(KUBEPKG) export \
		--log-level=debug \
		--storage-root=.tmp/kubepkg \
		--platform=linux/$(ARCH) \
		--output-manifests=.tmp/manifests/demo.yaml \
 		--output-oci=.tmp/demo.all.kube.tar \
 			./testdata/demo.list.yaml

k.apply.demo:
	$(KUBEPKG) apply --kubeconfig=$(KUBECONFIG) --force --dry-run ./testdata/demo.yaml


install.demo:
	$(KUBEPKG) upload -i=http://localhost:32060 ./testdata/demo.yaml

remote.debug: k.export remote.sync remote.ctr.import

remote.sync:
	scp .tmp/demo.kube.tgt root@localhost:/data/demo.kube.tar

remote.ctr.import:
	@echo "if kube.pkg multi-arch supported --all-platforms is required"
	ssh root@localhost "gzip --decompress --stdout /data/demo.kube.tgt | ctr image import --all-platforms -"

eval:
	cuem eval -o components.yaml ./cuepkg/kubepkg

update.node:
	pnpm up -r --latest

clean.node:
	find . -name 'node_modules' -type d -prune -print -exec rm -rf '{}' \;

dep.node:
	pnpm install

lint.node:
	pnpm exec turbo run lint --force

build.node:
	pnpm exec turbo run build --force

build.dashboard:
	APP=dashboard pnpm exec vite build --mode production

dev.dashboard:
	pnpm exec vite

build.webapp:
	$(WAGON) do webapp build --output=cmd/kubepkg/webapp

ship:
	$(WAGON) do go ship pushx

archive:
	$(WAGON) do --output=.wagon/build go archive

kubetgz:
	$(WAGON) do kubepkg $(ARCH)

kubetgt.dashboard:
	$(WAGON) do dashboard $(ARCH)

KUBEPKGTGZ=.build/kubepkg/$(ARCH)/images/kubepkg.$(ARCH).kube.tar


