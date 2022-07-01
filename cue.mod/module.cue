module: "github.com/octohelm/kubepkg"

require: {
	"dagger.io":                      "v0.3.0"
	"github.com/innoai-tech/runtime": "v0.0.0-20220624081938-3e42d0c3cd66"
	"k8s.io/api":                     "v0.24.1"
	"k8s.io/apimachinery":            "v0.24.1"
	"universe.dagger.io":             "v0.3.0"
}

replace: {
	"k8s.io/api":          "" @import("go")
	"k8s.io/apimachinery": "" @import("go")
}
