FROM --platform=$BUILDPLATFORM golang:1.18-buster AS builder

WORKDIR /go/src
COPY ./ ./

ARG TARGET_EXEC
ARG TARGET_ARCH
RUN make build TARGET_EXEC="${TARGET_EXEC}" TARGET_ARCH="${TARGET_ARCH}"

FROM gcr.io/distroless/static-debian10:latest

ARG TARGETARCH
COPY --from=builder /go/src/bin/kubepkg-linux-${TARGETARCH} /kubepkg

WORKDIR /

ENV KUBEPKG_STORAGE_ROOT="/etc/kubepkg"

CMD ["serve", "registry"]
ENTRYPOINT ["/kubepkg"]
