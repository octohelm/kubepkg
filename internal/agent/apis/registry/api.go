// +gengo:operator:register=R
// +gengo:operator:tag=registry
package registry

import (
	"github.com/octohelm/courier/pkg/courier"
	authoperator "github.com/octohelm/kubepkg/internal/agent/apis/auth/operator"
)

var R = courier.NewRouter(&authoperator.ValidAccount{})
