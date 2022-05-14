package main

import (
	"strings"

	"dagger.io/dagger"
	"dagger.io/dagger/core"
	"universe.dagger.io/docker"
	"universe.dagger.io/alpine"
	"github.com/octohelm/kubepkg/cuepkg/tool"
)

dagger.#Plan & {
	client: {
		env: {
			VERSION: string | *"dev"
			GIT_SHA: string | *""
			GIT_REF: string | *""

			GOPROXY:   string | *""
			GOPRIVATE: string | *""
			GOSUMDB:   string | *""

			GH_USERNAME: string | *""
			GH_PASSWORD: dagger.#Secret
		}

		for _os in actions.build.os for _arch in actions.build.arch {
			filesystem: "build/output/\(actions.build.name)_\(_os)_\(_arch)": write: contents: actions.build["\(_os)"]["\(_arch)"].output
		}
	}

	actions: {
		_source: core.#Source & {
			path: "."
			include: [
				"cmd/",
				"pkg/",
				"go.mod",
				"go.sum",
			]
		}
		_env: {
			for k, v in client.env if k != "$dagger" {
				"\(k)": v
			}
		}

		_imageName: "ghcr.io/octohelm/kubepkg"

		_version: [
				if strings.HasPrefix(_env.GIT_REF, "refs/tags/v") {
				strings.TrimPrefix(_env.GIT_REF, "refs/tags/v")
			},
			if strings.HasPrefix(_env.GIT_REF, "refs/heads/") {
				strings.TrimPrefix(_env.GIT_REF, "refs/heads/")
			},
			_env.VERSION,
		][0]

		_tag: _version

		info: tool.#GoModInfo & {
			source: _source.output
		}

		_archs: ["amd64", "arm64"]

		build: tool.#GoBuild & {
			source: _source.output
			arch:   _archs
			os: ["linux"]
			env: _env & {
				CGO_ENABLED: "0"
			}
			ldflags: [
				"-s -w",
				"-X \(info.module)/version.Version=\(_version)",
				"-X \(info.module)/version.Revision=\(_env.GIT_SHA)",
			]
			package: "./cmd/kubepkg"
		}

		image: {
			for _arch in _archs {
				"\(_arch)": docker.#Build & {
					steps: [
						alpine.#Build & {
							packages: {
								"ca-certificates": {}
							}
						},
						docker.#Copy & {
							contents: build.linux["\(_arch)"].output
							source:   "./kubepkg"
							dest:     "/kubepkg"
						},
						docker.#Set & {
							config: {
								label: {
									"org.opencontainers.image.source":   "https://\(info.module)"
									"org.opencontainers.image.revision": "\(_env.GIT_SHA)"
								}
								workdir: "/"
								env: KUBEPKG_STORAGE_ROOT: "/etc/kubepkg"
								cmd: ["serve", "registry"]
								entrypoint: ["/kubepkg"]
							}
						},
					]
				}
			}
		}

		push: docker.#Push & {
			dest: "\(_imageName):\(_tag)"
			images: {
				for _arch in _archs {
					"linux/\(_arch)": image["\(_arch)"].output
				}
			}
			auth: {
				username: _env.GH_USERNAME
				secret:   _env.GH_PASSWORD
			}
		}
	}
}
