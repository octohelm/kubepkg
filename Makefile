export GIT_SHA ?= $(shell git rev-parse HEAD)
export GIT_REF ?= HEAD

ARCH=$(shell go env GOARCH)

KUBECONFIG = ${HOME}/.kube/config
KUBEPKG = go run ./cmd/kubepkg

gen:
	go run ./tool/internal/cmd/tool gen ./cmd/kubepkg

test:
	CI=true go test -v ./pkg/...
	CI=true go test -v ./internal/...

install:
	go install ./cmd/kubepkg

gen.kubepkg:
	cuem gen -i=go -o ./cuepkg/kubepkg ./pkg/apis/kubepkg/v1alpha1

k.k8s: gen.kubepkg
	$(KUBEPKG) serve operator --dump-k8s
	$(KUBEPKG) serve registry --dump-k8s
	$(KUBEPKG) serve agent --dump-k8s
	$(KUBEPKG) serve dashboard --dump-k8s


k.dashboard:
	$(KUBEPKG) serve dashboard --log-level=debug -c \
		--addr=:8081 \
 		--db-enable-migrate \
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
		--agent-addr=:32060 \
		--storage-root=.tmp/kubepkg \
		--platform=linux/$(ARCH) \
		--kubeconfig=$(KUBECONFIG) \
			serve agent

k.registry:
	$(KUBEPKG) \
		--registry-addr=:6060 \
		--storage-root=.tmp/kubepkg \
			serve registry

k.export:
	$(KUBEPKG) export \
		--log-level=debug \
		--storage-root=.tmp/kubepkg \
		--platform=linux/$(ARCH) \
		--extract-manifests-yaml=.tmp/manifests/demo.yaml \
 		--output=.tmp/demo.kube.tgz \
 			./testdata/demo.yaml

k.export.list:
	$(KUBEPKG) export \
		--log-level=debug \
		--storage-root=.tmp/kubepkg \
		--platform=linux/$(ARCH) \
		--extract-manifests-yaml=.tmp/manifests/demo.yaml \
 		--output=.tmp/demo.kube.tgz \
 			./testdata/demo.list.yaml

k.apply.demo:
	$(KUBEPKG) apply --kubeconfig=$(KUBECONFIG) --force --dry-run ./testdata/demo.yaml

k.manifests:
	$(KUBEPKG) manifests ./testdata/demo.yaml

k.import:
	mkdir -p .tmp/manifests
	$(KUBEPKG) import --import-to=.tmp/kubepkg --manifest-output=.tmp/manifests .tmp/demo.kube.tgz

k.import.remote:
	@echo "incremental import with spec directly"
	$(KUBEPKG) import --import-to=http://0.0.0.0:32060 --incremental ./testdata/demo.yaml
	@echo "incremental import with debug"
	$(KUBEPKG) import --log-level=debug --import-to=http://0.0.0.0:32060 --incremental .tmp/demo.kube.tgz
	@echo "incremental import without debug"
	$(KUBEPKG) import --import-to=http://0.0.0.0:32060 --incremental .tmp/demo.kube.tgz
	@echo "import kube.tgz debug"
	$(KUBEPKG) import --import-to=http://0.0.0.0:32060 .tmp/demo.kube.tgz

install.demo:
	$(KUBEPKG) import -i=http://localhost:32060 ./testdata/demo.yaml

debug: k.export k.import

remote.debug: k.export remote.sync remote.ctr.import

remote.sync:
	scp .tmp/demo.kube.tgz root@localhost:/data/demo.kube.tgz

remote.ctr.import:
	@echo "if kube.pkg multi-arch supported --all-platforms is required"
	ssh root@localhost "gzip --decompress --stdout /data/demo.kube.tgz | ctr image import --all-platforms -"

eval:
	cuem eval -o components.yaml ./cuepkg/kubepkg

update.node:
	pnpm up -r --latest

dep.node:
	pnpm i

lint.node:
	pnpm exec turbo run lint --force

build.node:
	pnpm exec turbo run build --force

dev.agent:
	pnpm exec turbo run dev --filter=@webapp/agent

dev.dashboard:
	pnpm exec turbo run dev --filter=@webapp/dashboard

build.webapp:
	dagger do webapp

ship:
	dagger do go ship pushx

kubetgz:
	dagger do kubepkg $(ARCH)

kubetgz.dashboard:
	dagger do dashboard $(ARCH)

KUBEPKGTGZ=.build/kubepkg/$(ARCH)/images/kubepkg.$(ARCH).kube.tgz

deploy:
	$(KUBEPKG) import \
		--import-to=http://localhost:32060 \
		$(KUBEPKGTGZ)

