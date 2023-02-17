module: "github.com/octohelm/kubepkg"

require: {
	"github.com/innoai-tech/runtime": "v0.0.0-20230301034018-d0f9cf039113"
	"k8s.io/api":                     "v0.25.4"
	"k8s.io/apimachinery":            "v0.25.4"
	"wagon.octohelm.tech":            "v0.0.0-20200202235959-e64a70c55ed2"
}

replace: {
	"k8s.io/api":          "" @import("go")
	"k8s.io/apimachinery": "" @import("go")
}
