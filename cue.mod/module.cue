module: "github.com/octohelm/kubepkg"

require: {
	"github.com/innoai-tech/runtime": "v0.0.0-20230822100237-c611c3ecb10d"
	"wagon.octohelm.tech":            "v0.0.0"
}

replace: {
	"k8s.io/api":          "" @import("go")
	"k8s.io/apimachinery": "" @import("go")
}
