FROM gcr.io/distroless/static-debian10:latest

ARG TARGETARCH
COPY ./bin/kubepkg-operator-linux-${TARGETARCH} /go/bin/kubepkg-operator

WORKDIR /go/bin


ARG TARGETPLATFORM
ENV REGISTRY_PLATFORMS=${TARGETPLATFORM}
ENV REGISTRY_PORT=6061

# mount ${STORAGE_ROOT}/kubepkg for kubepkg
ENV STORAGE_ROOT="/etc/crpe"

ENV PROXY_ENDPOINT=""
ENV PROXY_USERNAME=""
ENV PROXY_PASSWORD=""


ENTRYPOINT ["/go/bin/kubepkg-operator"]
