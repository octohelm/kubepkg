package main

import (
	"strings"
	"encoding/yaml"

	"dagger.io/dagger"
	"dagger.io/dagger/core"

	"github.com/innoai-tech/runtime/cuepkg/kubepkg"
	"github.com/innoai-tech/runtime/cuepkg/tool"
	"github.com/innoai-tech/runtime/cuepkg/imagetool"
	"github.com/innoai-tech/runtime/cuepkg/node"
	"github.com/innoai-tech/runtime/cuepkg/golang"

	kubepkgcomponent "github.com/octohelm/kubepkg/cuepkg/kubepkg"
)

dagger.#Plan

client: env: {
	VERSION: string | *"dev"
	GIT_SHA: string | *""
	GIT_REF: string | *""

	GOPROXY:   string | *""
	GOPRIVATE: string | *""
	GOSUMDB:   string | *""

	GH_USERNAME: string | *""
	GH_PASSWORD: dagger.#Secret

	LINUX_MIRROR:                  string | *""
	CONTAINER_REGISTRY_PULL_PROXY: string | *""

	KUBEPKG_REMOTE_REGISTRY_ENDPOINT: _ | *""
	KUBEPKG_REMOTE_REGISTRY_USERNAME: _ | *""
	KUBEPKG_REMOTE_REGISTRY_PASSWORD: _ | *""
}

client: filesystem: "build/output": write: contents: actions.go.archive.output

actions: version: tool.#ResolveVersion & {
	ref:     "\(client.env.GIT_REF)"
	version: "\(client.env.VERSION)"
}

mirror: {
	linux: client.env.LINUX_MIRROR
	pull:  client.env.CONTAINER_REGISTRY_PULL_PROXY
}

auths: "ghcr.io": {
	username: client.env.GH_USERNAME
	secret:   client.env.GH_PASSWORD
}

actions: agentui: node.#ViteProject & {
	source: {
		path: "."
		include: [
			"webapp/",
			"nodepkg/",
			"package.json",
			"pnpm-lock.yaml",
			"tsconfig.json",
			"vite.config.ts",
		]
	}

	env: APP: "agent"

	build: {
		pre: [
			"pnpm install",
		]
		image: {
			"mirror": mirror
			steps: [
				node.#ConfigPrivateRegistry & {
					scope: "@innoai-tech"
					host:  "npm.pkg.github.com"
					token: client.env.GH_PASSWORD
				},
				imagetool.#Script & {
					run: [
						"npm i -g pnpm",
					]
				},
			]
		}
	}
}

actions: go: golang.#Project & {
	source: {
		path: "."
		include: [
			"cmd/",
			"pkg/",
			"internal/",
			"go.mod",
			"go.sum",
		]
	}

	version:  actions.version.output
	revision: client.env.GIT_SHA

	goos: ["linux", "darwin"]
	goarch: ["amd64", "arm64"]
	main: "./cmd/kubepkg"
	ldflags: [
		"-s -w",
		"-X \(go.module)/pkg/version.Version=\(go.version)",
		"-X \(go.module)/pkg/version.Revision=\(go.revision)",
	]

	mounts: {
		webui: core.#Mount & {
			contents: actions.agentui.build.output.rootfs
			source:   "/output"
			dest:     "/go/src/internal/agent/dist"
		}
	}

	env: {
		GOPROXY:   client.env.GOPROXY
		GOPRIVATE: client.env.GOPRIVATE
		GOSUMDB:   client.env.GOSUMDB
	}

	build: {
		pre: [
			"go mod download",
		]
	}

	ship: {
		name: "\(strings.Replace(go.module, "github.com/", "ghcr.io/", -1))"
		from: "gcr.io/distroless/static-debian11:debug"
		config: {
			workdir: "/"
			env: {
				KUBEPKG_STORAGE_ROOT: "/etc/kubepkg"
			}
			cmd: ["serve", "registry"]
		}
	}
	"auths":  auths
	"mirror": mirror
}

actions: "kubepkg": {
	_version: "dev@sha256:c96854e97ef8d985feb683e26b9552591aeed292753442c99f7c649f934c67da"
	//        _version: "f4118d4"

	core.#WriteFile & {
		input:    dagger.#Scratch
		path:     "/kubepkg.yaml"
		contents: yaml.Marshal(kubepkg.#KubePkg & {
			metadata: name:      "kubepkg"
			metadata: namespace: "kube-system"
			spec: "version":     "1.2.0+kubepkg"
			spec: images: {
				"ghcr.io/octohelm/kubepkg": "\(_version)"
			}

			spec: manifests: {
				agent: (kubepkgcomponent.#Agent & {
					app: version: "\(_version)"
				}).kube
				operator: (kubepkgcomponent.#Operator & {
					app: version: "\(_version)"
				}).kube
				registry: (kubepkgcomponent.#Registry & {
					app: version: "\(_version)"
					config: {
						"KUBEPKG_REMOTE_REGISTRY_ENDPOINT": "\(client.env.KUBEPKG_REMOTE_REGISTRY_ENDPOINT)"
						"KUBEPKG_REMOTE_REGISTRY_USERNAME": "\(client.env.KUBEPKG_REMOTE_REGISTRY_USERNAME)"
						"KUBEPKG_REMOTE_REGISTRY_PASSWORD": "\(client.env.KUBEPKG_REMOTE_REGISTRY_PASSWORD)"
					}
				}).kube
			}
		})
	}
}

client: filesystem: "build/kubepkg": write: contents: actions.kubepkg.output
