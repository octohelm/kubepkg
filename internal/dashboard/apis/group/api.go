// +gengo:operator:register=R
// +gengo:operator:tag=group
package group

import (
	"github.com/octohelm/courier/pkg/courier"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
)

var R = courier.NewRouter(&authoperator.ValidAccount{})
