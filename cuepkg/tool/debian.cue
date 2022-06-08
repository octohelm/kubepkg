package tool

import (
	"strings"

	"universe.dagger.io/docker"
)

#DebianVersion: "bullseye"

#DebianBuild: {
	platform?: string
	source:    string | *"index.docker.io/debian:\(#DebianVersion)-slim"
	packages: [pkgName=string]: string | *""

	_build: docker.#Build & {
		steps: [
			docker.#Pull & {
				"source": source
				if platform != _|_ {
					"platform": platform
				}
			},
			//   docker.#Run & {
			//    command: {
			//     name: "sh"
			//     flags: "-c": """
			//      apt-get update -y
			//      apt-get install -y -f netselect-apt
			//      rm -rf /var/lib/apt/lists/*
			//      cd /etc/apt && netselect-apt
			//      """
			//    }
			//   },
			docker.#Run & {
				command: {
					name: "sh"
					flags: "-c": strings.Join([
							"apt-get update -y",
							for _pkgName, _version in packages {"apt-get install -y -f \(_pkgName)\(_version)"},
							"rm -rf /var/lib/apt/lists/*",
					], "\n")
				}
			},
		]
	}

	output: _build.output
}
