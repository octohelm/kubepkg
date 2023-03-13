package tool

import (
	"wagon.octohelm.tech/core"

	"github.com/octohelm/kubepkg/cuepkg/kubepkg"
	"github.com/octohelm/kubepkg/cuepkg/kubepkgcli"
	kubepkgcomponent "github.com/octohelm/kubepkg/cuepkg/component/kubepkg"
)

actions: {
	_env: core.#ClientEnv & {
		KUBEPKG_REMOTE_REGISTRY_ENDPOINT: _ | *""
		KUBEPKG_REMOTE_REGISTRY_USERNAME: _ | *""
		KUBEPKG_REMOTE_REGISTRY_PASSWORD: _ | *""

		KUBEPKG_AUTH_PROVIDER_OIDC_ENDPOINT: _ | *""
		KUBEPKG_SIGN_PRIVATE_KEY:            _ | *""
		KUBEPKG_DB_ENDPOINT:                 _ | *""
	}

	_version: core.#Version & {
	}

	#Export: kubepkgcli.#Export & {
		"run": tag: "\(_version.output)"
		"env": {
			"KUBEPKG_LOG_LEVEL":                "DEBUG"
			"KUBEPKG_REMOTE_REGISTRY_ENDPOINT": "\(_env.KUBEPKG_REMOTE_REGISTRY_ENDPOINT)"
			"KUBEPKG_REMOTE_REGISTRY_USERNAME": "\(_env.KUBEPKG_REMOTE_REGISTRY_USERNAME)"
			"KUBEPKG_REMOTE_REGISTRY_PASSWORD": "\(_env.KUBEPKG_REMOTE_REGISTRY_PASSWORD)"
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
						version: "\(_version.output)"
						config: {
							"KUBEPKG_SIGN_PRIVATE_KEY":            "\(_env.KUBEPKG_SIGN_PRIVATE_KEY)"
							"KUBEPKG_AUTH_PROVIDER_OIDC_ENDPOINT": "\(_env.KUBEPKG_AUTH_PROVIDER_OIDC_ENDPOINT)"
							"KUBEPKG_DB_ENDPOINT":                 "\(_env.KUBEPKG_DB_ENDPOINT)"
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
							spec: version:       "\(_version.output)"
						},
						kubepkgcomponent.#KubepkgOperator & {
							metadata: namespace: "kube-system"
							spec: version:       "\(_version.output)"
						},
						kubepkgcomponent.#ContainerRegistry & {
							metadata: namespace: "kube-system"
							spec: {
								version: "\(_version.output)"
								config: {
									"KUBEPKG_REMOTE_REGISTRY_ENDPOINT": "@secret/container-registry/endpoint?"
									"KUBEPKG_REMOTE_REGISTRY_USERNAME": "@secret/container-registry/username?"
									"KUBEPKG_REMOTE_REGISTRY_PASSWORD": "@secret/container-registry/password?"
								}
							}
						},
					]
				}
			}
		}
	}
}
