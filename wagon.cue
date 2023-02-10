package main

import (
	"strings"

	"wagon.octohelm.tech/core"
	"github.com/innoai-tech/runtime/cuepkg/imagetool"
	"github.com/innoai-tech/runtime/cuepkg/node"
	"github.com/innoai-tech/runtime/cuepkg/golang"
	kubepkg "github.com/octohelm/kubepkg/cuepkg/kubepkg:v1alpha1"
	"github.com/octohelm/kubepkg/cuepkg/kubepkgcli"
	kubepkgcomponent "github.com/octohelm/kubepkg/cuepkg/component/kubepkg"
)

pkg: {
	version: core.#Version & {
	}
}

client: core.#Client & {
	env: {
		GOPROXY:   string | *""
		GOPRIVATE: string | *""
		GOSUMDB:   string | *""

		GH_USERNAME: string | *""
		GH_PASSWORD: core.#Secret

		LINUX_MIRROR:                  string | *""
		CONTAINER_REGISTRY_PULL_PROXY: string | *""
		NPM_REGISTRY_SERVER:           string | *""

		KUBEPKG_REMOTE_REGISTRY_ENDPOINT: _ | *""
		KUBEPKG_REMOTE_REGISTRY_USERNAME: _ | *""
		KUBEPKG_REMOTE_REGISTRY_PASSWORD: _ | *""

		KUBEPKG_AUTH_PROVIDER_OIDC_ENDPOINT: _ | *""
		KUBEPKG_SIGN_PRIVATE_KEY:            _ | *""
		KUBEPKG_DB_ENDPOINT:                 _ | *""
	}
}

setting: core.#Setting & {
	registry: "ghcr.io": auth: {
		username: client.env.GH_USERNAME
		secret:   client.env.GH_PASSWORD
	}
}

mirror: {
	linux: client.env.LINUX_MIRROR
	pull:  client.env.CONTAINER_REGISTRY_PULL_PROXY
}

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
		exclude: [
			"node_modules",
		]
	}

	env: {
		"CI": "true"
	}

	build: {
		outputs: {
			"agent/dist":     "webapp/agent/dist"
			"dashboard/dist": "webapp/dashboard/dist"
		}
		pre: [
			"pnpm install",
		]
		script: "pnpm exec turbo run build --no-cache"
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

	"mirror": mirror
}

actions: {
	_version: pkg.version.output

	#Export: kubepkgcli.#Export & {
		"run": tag: "\(_version)"
		"env": {
			"KUBEPKG_LOG_LEVEL":                "DEBUG"
			"KUBEPKG_REMOTE_REGISTRY_ENDPOINT": "\(client.env.KUBEPKG_REMOTE_REGISTRY_ENDPOINT)"
			"KUBEPKG_REMOTE_REGISTRY_USERNAME": "\(client.env.KUBEPKG_REMOTE_REGISTRY_USERNAME)"
			"KUBEPKG_REMOTE_REGISTRY_PASSWORD": "\(client.env.KUBEPKG_REMOTE_REGISTRY_PASSWORD)"
		}
	}

	"dashboard": {
		for arch in ["amd64", "arm64"] {
			"\(arch)": #Export & {
				"arch":     "\(arch)"
				"filename": "dashboard.\(arch).kube.tgz"
				"kubepkg":  kubepkgcomponent.#KubepkgDashboard & {
					metadata: namespace: "kubepkg"
					spec: {
						version: "\(_version)"
						config: {
							"KUBEPKG_SIGN_PRIVATE_KEY":            "\(client.env.KUBEPKG_SIGN_PRIVATE_KEY)"
							"KUBEPKG_AUTH_PROVIDER_OIDC_ENDPOINT": "\(client.env.KUBEPKG_AUTH_PROVIDER_OIDC_ENDPOINT)"
							"KUBEPKG_DB_ENDPOINT":                 "\(client.env.KUBEPKG_DB_ENDPOINT)"
							"KUBEPKG_DB_ENABLE_MIGRATE":           "true"
						}
					}
				}
			}
		}
	}

	"kubepkg": {
		for arch in ["amd64", "arm64"] {
			"\(arch)": #Export & {
				"arch":     "\(arch)"
				"filename": "kubepkg.\(arch).kube.tgz"
				"kubepkg":  kubepkg.#KubePkgList & {
					items: [
						kubepkgcomponent.#KubepkgAgent & {
							metadata: namespace: "kube-system"
							spec: version:       "\(_version)"
						},
						kubepkgcomponent.#KubepkgOperator & {
							metadata: namespace: "kube-system"
							spec: version:       "\(_version)"
						},
						kubepkgcomponent.#ContainerRegistry & {
							metadata: namespace: "kube-system"
							spec: {
								version: "\(_version)"
								config: {
									"KUBEPKG_REMOTE_REGISTRY_ENDPOINT": "@secret.container-registry/endpoint?"
									"KUBEPKG_REMOTE_REGISTRY_USERNAME": "@secret.container-registry/username?"
									"KUBEPKG_REMOTE_REGISTRY_PASSWORD": "@secret.container-registry/password?"
								}
							}
						},
					]
				}
			}
		}
	}
}