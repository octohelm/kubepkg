package kubepkgcli

import (
	"universe.dagger.io/docker"
)

#DefaultTag: "v0.2.1-0.20230213032121-85356f9fac43"

#Run: {
	tag: string | *#DefaultTag

	docker.#Run & {
		workdir: "/build"
	}
}

#Image: {
	tag: string | *#DefaultTag

	docker.#Pull & {
		source: "ghcr.io/octohelm/kubepkg:\(tag)"
	}
}
