package kubepkgcli

import (
	"path"
	"encoding/json"

	"wagon.octohelm.tech/core"
	"wagon.octohelm.tech/docker"

	spec "github.com/octohelm/kubepkg/cuepkg/kubepkg"
)

#Export: {
	filename: string
	kubepkg:  spec.#KubePkg | spec.#KubePkgList
	arch:     string
	env:      docker.#Run.env

	_files: [Path=string]: core.#WriteFile & {
	}

	_files: "/src/kubepkg.json": {
		path:     "kubepkg.json"
		contents: json.Marshal(kubepkg)
	}

	_caches: kubepkg_cache: core.#Mount & {
		dest:     "/etc/kubepkg"
		contents: core.#CacheDir & {
			id:          "kubepkg_cache"
			concurrency: "locked"
		}
	}

	image: #Image & {}

	run: #Run & {
		input:  image.output
		mounts: _caches & {
			for p, f in _files {
				"\(p)": core.#Mount & {
					dest:     p
					source:   f.path
					contents: f.output
				}
			}
		}
		"env": env
		command: {
			name: "export"
			args: [
				"--storage-root=/etc/kubepkg",
				"--platform=linux/\(arch)",
				"--extract-manifests-yaml=/build/manifests/\(path.Base(filename)).yaml",
				"--output=/build/images/\(filename)",
				"/src/kubepkg.json",
			]
		}
	}

	_output: core.#Subdir & {
		input: run.output.rootfs
		path:  run.workdir
	}

	output: _output.output
}
