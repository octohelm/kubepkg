build:
	$(MAKE) go.xbuild TARGET_OS=linux TARGET_ARCH="$(TARGET_ARCH)"

KUBEPKG = $(GO_RUN)

serve.operator:
	$(KUBEPKG) \
		--watch-namespace=default \
		--kubeconfig=${HOME}/.kube/config--crpe-test.yaml \
			serve operator

serve.agent:
	$(KUBEPKG) \
		--addr=:36060 \
		--storage-root=.tmp/kubepkg \
		--platform=linux/$(shell go env GOARCH) \
		--kubeconfig=${HOME}/.kube/config--crpe-test.yaml \
			serve agent

serve.registry:
	$(KUBEPKG) \
		--addr=:6060 \
		--storage-root=.tmp/kubepkg \
			serve registry

kubepkg.save:
	$(KUBEPKG) save -v=1 --storage-root=.tmp/kubepkg --platform=linux/amd64 --platform=linux/arm64 --output=.tmp/demo.tgz ./testdata/demo.yaml

kubepkg.import:
	mkdir -p .tmp/manifests
	$(KUBEPKG) import -i=.tmp/kubepkg --manifest-output=.tmp/manifests .tmp/demo.tgz

kubepkg.import.remote:
	@echo "incremental import without debug"
	$(KUBEPKG) import -i=http://0.0.0.0:36060 --incremental .tmp/demo.tgz
	@echo "incremental import with debug"
	$(KUBEPKG) import -v=1 -i=http://0.0.0.0:36060 --incremental .tmp/demo.tgz
#	$(KUBEPKG) import -i=http://0.0.0.0:36060 .tmp/demo.tgz

debug: kubepkg.save kubepkg.import

include tools/mk/*.mk
