FROM gcr.io/distroless/static-debian10:latest

ARG TARGETARCH
COPY ./bin/kubepkg-linux-${TARGETARCH} /kubepkg

WORKDIR /

ENV KUBEPKG_STORAGE_ROOT="/etc/kubepkg"

CMD ["serve", "registry"]
ENTRYPOINT ["/container-registry"]
