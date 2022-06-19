package main

import (
	"strings"

	"dagger.io/dagger"
	"dagger.io/dagger/core"

	"github.com/innoai-tech/runtime/cuepkg/tool"
	"github.com/innoai-tech/runtime/cuepkg/crutil"
	"github.com/innoai-tech/runtime/cuepkg/node"
	"github.com/innoai-tech/runtime/cuepkg/golang"
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

	LINUX_MIRROR: string | *""
}

client: filesystem: "build/output": write: contents: actions.go.archive.output

actions: version: tool.#ResolveVersion & {
	ref:     "\(client.env.GIT_REF)"
	version: "\(client.env.VERSION)"
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
			mirror: client.env.LINUX_MIRROR
			steps: [
				node.#ConfigPrivateRegistry & {
					scope: "@innoai-tech"
					host:  "npm.pkg.github.com"
					token: client.env.GH_PASSWORD
				},
				crutil.#Script & {
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
		image: mirror: client.env.LINUX_MIRROR
	}

	ship: {
		name: "\(strings.Replace(go.module, "github.com/", "ghcr.io/", -1))"

		image: {
			source: "debian:bullseye-slim"
		}

		config: {
			workdir: "/"
			env: {
				KUBEPKG_STORAGE_ROOT: "/etc/kubepkg"
			}
			cmd: ["serve", "registry"]
		}

		push: auth: {
			username: client.env.GH_USERNAME
			secret:   client.env.GH_PASSWORD
		}
	}
}
