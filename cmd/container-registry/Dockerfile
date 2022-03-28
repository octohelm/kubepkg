FROM gcr.io/distroless/static-debian10:latest

ARG TARGETARCH
COPY ./bin/container-registry-linux-${TARGETARCH} /go/bin/container-registry

WORKDIR /go/bin


ARG TARGETPLATFORM
ENV REGISTRY_PLATFORMS=${TARGETPLATFORM}
ENV REGISTRY_PORT=6060

# mount ${STORAGE_ROOT}/docker for container registry
ENV STORAGE_ROOT="/etc/crpe"

ENV PROXY_ENDPOINT=""
ENV PROXY_USERNAME=""
ENV PROXY_PASSWORD=""


ENTRYPOINT ["/go/bin/container-registry"]
