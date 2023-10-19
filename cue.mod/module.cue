module: "github.com/octohelm/kubepkg"

require: {
	"github.com/innoai-tech/runtime": "v0.0.0-20231019111209-7659363d4202"
	"wagon.octohelm.tech":            "v0.0.0"
}

replace: {
	"k8s.io/api":          "" @import("go")
	"k8s.io/apimachinery": "" @import("go")
}
