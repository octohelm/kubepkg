module: "github.com/octohelm/kubepkg"

require: {
	"dagger.io":                          "v0.2.8-0.20220513062922-fef589b33ac3" @vcs("release-main")
	"github.com/innoai-tech/runtime":     "v0.0.0-20220601071556-095a6fb0ff7a"
	"github.com/innoai-tech/webappserve": "v0.0.0-20220513070549-200ff12980f5"
	"k8s.io/api":                         "v0.24.1"
	"k8s.io/apimachinery":                "v0.24.1"
	"universe.dagger.io":                 "v0.2.8-0.20220513062922-fef589b33ac3" @vcs("release-main")
}

replace: {
	"dagger.io":          "github.com/morlay/dagger/pkg/dagger.io@release-main"
	"universe.dagger.io": "github.com/morlay/dagger/pkg/universe.dagger.io@release-main"
}

replace: {
	"k8s.io/api":          "" @import("go")
	"k8s.io/apimachinery": "" @import("go")
}
