package kubepkgcli

import (
	"encoding/json"

	"dagger.io/dagger"
	"dagger.io/dagger/core"

	spec "github.com/octohelm/kubepkg/cuepkg/kubepkg:v1alpha1"
)

#Apply: {
	kubepkg:    spec.#KubePkg
	kubeconfig: dagger.#Secret

	flags: [K=string]: string

	_files: [Path=string]: core.#WriteFile & {
		input: dagger.#Scratch
	}

	_files: "/src/kubepkg.json": {
		path:     "kubepkg.json"
		contents: json.Marshal(kubepkg)
	}

	#Run & {
		mounts: {
			"kubeconfig": core.#Mount & {
				dest:     "/run/secrets/kubeconfig"
				contents: kubeconfig
			}

			for p, f in _files {
				"\(p)": core.#Mount & {
					dest:     p
					source:   f.path
					contents: f.output
				}
			}
		}
		command: {
			name: "apply"
			args: [
				"--kubeconfig=/run/secrets/kubeconfig",
				for _k, _v in flags {
					"\(_k)=\(_v)"
				},
				"/src/kubepkg.json",
			]
		}
	}
}
