/*
Package user GENERATED BY gengo:operator
DON'T EDIT THIS FILE
*/
package user

import (
	github_com_octohelm_courier_pkg_courier "github.com/octohelm/courier/pkg/courier"
	github_com_octohelm_kubepkg_internal_dashboard_apis_auth_operator "github.com/octohelm/kubepkg/internal/dashboard/apis/auth/operator"
	github_com_octohelm_kubepkg_pkg_rbac "github.com/octohelm/kubepkg/pkg/rbac"
)

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&CurrentPermissions{}))
}

func (*CurrentPermissions) ResponseContent() any {
	return &github_com_octohelm_kubepkg_pkg_rbac.Permissions{}
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&CurrentUser{}))
}

func (*CurrentUser) ResponseContent() any {
	return &github_com_octohelm_kubepkg_internal_dashboard_apis_auth_operator.Account{}
}
