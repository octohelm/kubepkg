ARCH=$(shell go env GOARCH)

WAGON = wagon -p wagon.cue

DEBUG = 0
ifeq ($(DEBUG),1)
	WAGON := $(WAGON) --log-level=debug
endif

KUBECONFIG = ${HOME}/.kube/config
KUBEPKG = go run ./cmd/kubepkg

gen:
	go run ./tool/internal/cmd/tool gen ./cmd/kubepkg

test:
	CI=true go test -v ./pkg/...
	CI=true go test -v ./internal/...

install:
	go install ./cmd/kubepkg

k.k8s: gen.kubepkg
	$(KUBEPKG) serve operator --dump-k8s
	$(KUBEPKG) serve registry --dump-k8s
	$(KUBEPKG) serve agent --dump-k8s
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
 		--output=.tmp/demo.kube.tgt \
 			./testdata/demo.yaml

k.export.list:
	$(KUBEPKG) export \
		--log-level=debug \
		--storage-root=.tmp/kubepkg \
		--platform=linux/$(ARCH) \
		--extract-manifests-yaml=.tmp/manifests/demo.yaml \
 		--output=.tmp/demo.kube.tgt \
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
	@echo "import kube.tgt debug"
	$(KUBEPKG) import --import-to=http://0.0.0.0:32060 .tmp/demo.kube.tgz

install.demo:
	$(KUBEPKG) import -i=http://localhost:32060 ./testdata/demo.yaml

debug: k.export k.import

remote.debug: k.export remote.sync remote.ctr.import

remote.sync:
	scp .tmp/demo.kube.tgt root@localhost:/data/demo.kube.tgz

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

dev.agent:
	pnpm exec turbo run dev --filter=@webapp/agent

build.dashboard:
	APP=dashboard pnpm exec vite build --mode production

build.agent:
	APP=agent pnpm exec vite build --mode production

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

KUBEPKGTGZ=.build/kubepkg/$(ARCH)/images/kubepkg.$(ARCH).kube.tgz

deploy:
	$(KUBEPKG) import \
		--import-to=http://localhost:32060 \
		$(KUBEPKGTGZ)

