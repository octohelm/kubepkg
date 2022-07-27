// +gengo:operator:register=R
// +gengo:operator:tag=user
package user

import (
	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
	authoperator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
)

var R = courier.NewRouter(courierhttp.Group("/user"), &authoperator.ValidAccount{})
