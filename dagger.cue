package main

import (
	"strings"

	"dagger.io/dagger"

	"github.com/innoai-tech/runtime/cuepkg/kubepkg"
	"github.com/innoai-tech/runtime/cuepkg/tool"
	"github.com/innoai-tech/runtime/cuepkg/imagetool"
	"github.com/innoai-tech/runtime/cuepkg/node"
	"github.com/innoai-tech/runtime/cuepkg/golang"

	kubepkgcomponent "github.com/octohelm/kubepkg/cuepkg/component/kubepkg"
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

client: filesystem: "cmd/kubepkg/webapp": write: contents: actions.webapp.build.output
actions: webapp: node.#Project & {
	source: {
		path: "."
		include: [
			"webapp/",
			"nodepkg/",
			".npmrc",
			"pnpm-*.yaml",
			"*.json",
		]
	}

	env: "CI": "true"

	build: {
		outputs: {
			"agent/dist":     "webapp/agent/dist"
			"dashboard/dist": "webapp/dashboard/dist"
		}
		pre: [
			"pnpm install",
		]
		script: "pnpm exec turbo run build"
		image: {
			"mirror": mirror
			"steps": [
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

client: filesystem: ".build/output": write: contents: actions.go.archive.output
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
		"-X \(go.module)/pkg/version.version=\(go.version)",
		"-X \(go.module)/pkg/version.revision=\(go.revision)",
	]

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

client: filesystem: ".build/kubepkg": write: contents: actions.kubepkg.output
actions: "kubepkg": {
	_version: "\(strings.TrimLeft(actions.go.ship.pushx.result, "\(actions.go.ship.name):"))"

	kubepkg.#Export & {
		"run": tag: "\(_version)"
		"arch":     "amd64"
		"filename": "kubepkg.amd64.kube.tgz"
		"env": {
			"KUBEPKG_LOG_LEVEL":                "DEBUG"
			"KUBEPKG_REMOTE_REGISTRY_ENDPOINT": "\(client.env.KUBEPKG_REMOTE_REGISTRY_ENDPOINT)"
			"KUBEPKG_REMOTE_REGISTRY_USERNAME": "\(client.env.KUBEPKG_REMOTE_REGISTRY_USERNAME)"
			"KUBEPKG_REMOTE_REGISTRY_PASSWORD": "\(client.env.KUBEPKG_REMOTE_REGISTRY_PASSWORD)"
		}
		"kubepkg": kubepkg.#KubePkg & {
			metadata: name:      "kubepkg"
			metadata: namespace: "kube-system"
			spec: "version":     "1.2.0+kubepkg"
			spec: images: {
				"ghcr.io/octohelm/kubepkg:\(_version)": ""
			}
			spec: manifests: {
				agent: (kubepkgcomponent.#KubepkgAgent & {
					app: version: "\(_version)"
				}).kube
				operator: (kubepkgcomponent.#KubepkgOperator & {
					app: version: "\(_version)"
				}).kube
				registry: (kubepkgcomponent.#ContainerRegistry & {
					app: version: "\(_version)"
					config: {
						"KUBEPKG_REMOTE_REGISTRY_ENDPOINT": "\(client.env.KUBEPKG_REMOTE_REGISTRY_ENDPOINT)"
						"KUBEPKG_REMOTE_REGISTRY_USERNAME": "\(client.env.KUBEPKG_REMOTE_REGISTRY_USERNAME)"
						"KUBEPKG_REMOTE_REGISTRY_PASSWORD": "\(client.env.KUBEPKG_REMOTE_REGISTRY_PASSWORD)"
					}
				}).kube
			}
		}
	}
}
