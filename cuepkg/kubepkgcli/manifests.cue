package kubepkgcli

import (
	"encoding/json"

	"wagon.octohelm.tech/core"

	spec "github.com/octohelm/kubepkg/cuepkg/kubepkg:v1alpha1"
)

#Manifests: {
	kubepkg: spec.#KubePkg

	flags: [K=string]: string

	_kubepkg: core.#Nop & {
		input: kubepkg
	}

	_files: [Path=string]: core.#WriteFile & {
	}

	_files: "/src/kubepkg.json": {
		path:     "kubepkg.json"
		contents: json.Marshal(_kubepkg.output)
	}

	image: #Image & {}

	#Run & {
		input: image.output
		mounts: {
			for p, f in _files {
				"\(p)": core.#Mount & {
					dest:     p
					source:   f.path
					contents: f.output
				}
			}
		}
		command: {
			name: "manifests"
			args: [
				for _k, _v in flags {
					"\(_k)=\(_v)"
				},
				"/src/kubepkg.json",
			]
		}
	}
}
