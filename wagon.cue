package main

import (
	"strings"

	"wagon.octohelm.tech/core"

	"github.com/innoai-tech/runtime/cuepkg/kubepkgtool"
	"github.com/innoai-tech/runtime/cuepkg/golang"
	"github.com/innoai-tech/runtime/cuepkg/bun"

	"github.com/octohelm/kubepkg/tool"
	kubepkgcomponent "github.com/octohelm/kubepkg/cuepkg/component/kubepkg"
)

tool

actions: webapp: bun.#Project & {
	source: {
		path: "."
		include: [
			"nodedevpkg/",
			"nodepkg/",
			"webapp/",
			"*.json",
			"*.config.ts",
			"bun.lockb",
			"bunfig.toml",
		]
		exclude: [
			"**/.swc",
			"**/.turbo",
			"**/node_modules",
		]
	}

	_env: core.#ClientEnv & {
		GH_PASSWORD: core.#Secret
	}

	env: {
		"CI":                              "true"
		"INNOAI_TECH_REGISTRY_AUTH_TOKEN": _env.GH_PASSWORD
	}

	build: {
		outputs: {
			"dashboard/dist": "public/dashboard"
		}

		pre: [
			"bun install --no-save",
		]

		script: """
			APP=dashboard bunx --bun vite build --mode production
			"""
	}
}

pkg: {
	version: core.#Version & {
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

	version: pkg.version.output

	goos: ["linux", "darwin"]
	goarch: ["amd64", "arm64"]
	main: "./cmd/kubepkg"
	ldflags: [
		"-s -w",
		"-X \(go.module)/pkg/version.version=\(go.version)",
	]

	build: {
		pre: [
			"go mod download",
		]
	}

	ship: {
		name: "\(strings.Replace(go.module, "github.com/", "ghcr.io/", -1))"
		tag:  pkg.version.output
		from: "gcr.io/distroless/static-debian11:debug"
		config: {
			workdir: "/"
			env: {
				KUBEPKG_STORAGE_ROOT: "/etc/kubepkg"
			}
			cmd: ["serve", "registry"]
		}
	}
}

actions: apply: {
	operator: kubepkgtool.#ApplyToDashboard & {
		target: group: "system"
		kubepkg: kubepkgcomponent.#KubepkgOperator & {
			spec: version: pkg.version.output
		}
	}
	agent: kubepkgtool.#ApplyToDashboard & {
		target: group: "system"
		kubepkg: kubepkgcomponent.#KubepkgAgent & {
			spec: version: pkg.version.output
		}
	}
	registry: kubepkgtool.#ApplyToDashboard & {
		target: group: "system"
		kubepkg: kubepkgcomponent.#ContainerRegistry & {
			spec: version: pkg.version.output
		}
	}
}
