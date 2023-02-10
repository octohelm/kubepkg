module: "github.com/octohelm/kubepkg"

require: {
	"dagger.io":                      "v0.3.0"
	"github.com/innoai-tech/runtime": "v0.0.0-20230209080541-136477a0d9c6"
	"k8s.io/api":                     "v0.25.4"
	"k8s.io/apimachinery":            "v0.25.4"
	"universe.dagger.io":             "v0.3.0"
	"wagon.octohelm.tech":            "v0.0.0-20200202235959-7a5384938714"
}

replace: {
	"k8s.io/api":          "" @import("go")
	"k8s.io/apimachinery": "" @import("go")
}
