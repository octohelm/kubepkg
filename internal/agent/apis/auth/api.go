// +gengo:operator:register=R
// +gengo:operator:tag=auth
package auth

import (
	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp"
)

var R = courier.NewRouter(courierhttp.Group("/auth"))
