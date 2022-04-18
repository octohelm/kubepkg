build:
	$(MAKE) go.xbuild TARGET_OS=linux TARGET_ARCH="$(TARGET_ARCH)"

KUBEPKG = $(GO_RUN)
KUBECONFIG = ${HOME}/.kube_config/config--crpe-test.yaml

serve.operator:
	$(KUBEPKG) \
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
	$(KUBEPKG) export -v=1 --storage-root=.tmp/kubepkg --platform=linux/amd64 --platform=linux/arm64 --output=.tmp/demo.kube.tgz ./testdata/demo.yaml

kubepkg.import:
	mkdir -p .tmp/manifests
	$(KUBEPKG) import -i=.tmp/kubepkg --manifest-output=.tmp/manifests .tmp/demo.kube.tgz

kubepkg.import.remote:
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

include tools/mk/*.mk
