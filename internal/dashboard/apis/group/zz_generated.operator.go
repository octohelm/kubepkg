/*
Package group GENERATED BY gengo:operator
DON'T EDIT THIS FILE
*/
package group

import (
	github_com_octohelm_courier_pkg_courier "github.com/octohelm/courier/pkg/courier"
	github_com_octohelm_courier_pkg_statuserror "github.com/octohelm/courier/pkg/statuserror"
	github_com_octohelm_kubepkg_internal_dashboard_domain_account "github.com/octohelm/kubepkg/internal/dashboard/domain/account"
	github_com_octohelm_kubepkg_internal_dashboard_domain_group "github.com/octohelm/kubepkg/internal/dashboard/domain/group"
	github_com_octohelm_kubepkg_pkg_apis_kubepkg_v1alpha1 "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	github_com_octohelm_kubepkg_pkg_auth "github.com/octohelm/kubepkg/pkg/auth"
)

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&BindGroupEnvCluster{}))
}

func (*BindGroupEnvCluster) ResponseContent() any {
	return new(github_com_octohelm_kubepkg_internal_dashboard_domain_group.EnvWithCluster)
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&CreateGroupRobot{}))
}

func (*CreateGroupRobot) ResponseContent() any {
	return new(github_com_octohelm_kubepkg_internal_dashboard_domain_account.Robot)
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&DeleteGroup{}))
}

func (*DeleteGroup) ResponseContent() any {
	return nil
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&DeleteGroupAccount{}))
}

func (*DeleteGroupAccount) ResponseContent() any {
	return nil
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&DeleteGroupEnv{}))
}

func (*DeleteGroupEnv) ResponseContent() any {
	return nil
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&DeleteGroupEnvDeployment{}))
}

func (*DeleteGroupEnvDeployment) ResponseContent() any {
	return nil
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&GetGroup{}))
}

func (*GetGroup) ResponseContent() any {
	return new(github_com_octohelm_kubepkg_internal_dashboard_domain_group.Group)
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&ListGroup{}))
}

func (*ListGroup) ResponseContent() any {
	return new([]*github_com_octohelm_kubepkg_internal_dashboard_domain_group.Group)
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&ListGroupAccount{}))
}

func (*ListGroupAccount) ResponseContent() any {
	return new(github_com_octohelm_kubepkg_internal_dashboard_domain_group.UserDataList)
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&ListGroupEnv{}))
}

func (*ListGroupEnv) ResponseContent() any {
	return new([]*github_com_octohelm_kubepkg_internal_dashboard_domain_group.EnvWithCluster)
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&ListGroupEnvClusterDeployments{}))
}

func (*ListGroupEnvClusterDeployments) ResponseContent() any {
	return new([]github_com_octohelm_kubepkg_pkg_apis_kubepkg_v1alpha1.KubePkg)
}

func (*ListGroupEnvClusterDeployments) ResponseErrors() []error {
	return []error{
		&(github_com_octohelm_courier_pkg_statuserror.StatusErr{
			Code: 403,
			Key:  "NotBindCluster",
			Msg:  "NotBindCluster",
		}),
	}
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&ListGroupEnvDeployment{}))
}

func (*ListGroupEnvDeployment) ResponseContent() any {
	return new(github_com_octohelm_kubepkg_pkg_apis_kubepkg_v1alpha1.KubePkgList)
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&ListGroupEnvDeploymentHistory{}))
}

func (*ListGroupEnvDeploymentHistory) ResponseContent() any {
	return new([]*github_com_octohelm_kubepkg_pkg_apis_kubepkg_v1alpha1.KubePkg)
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&ListGroupRobot{}))
}

func (*ListGroupRobot) ResponseContent() any {
	return new(github_com_octohelm_kubepkg_internal_dashboard_domain_group.RobotDataList)
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&PutGroup{}))
}

func (*PutGroup) ResponseContent() any {
	return new(github_com_octohelm_kubepkg_internal_dashboard_domain_group.Group)
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&PutGroupAccount{}))
}

func (*PutGroupAccount) ResponseContent() any {
	return new(github_com_octohelm_kubepkg_internal_dashboard_domain_group.Account)
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&PutGroupEnv{}))
}

func (*PutGroupEnv) ResponseContent() any {
	return new(github_com_octohelm_kubepkg_internal_dashboard_domain_group.EnvWithCluster)
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&PutGroupEnvDeployment{}))
}

func (*PutGroupEnvDeployment) ResponseContent() any {
	return new(github_com_octohelm_kubepkg_pkg_apis_kubepkg_v1alpha1.KubePkg)
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&RefreshGroupRobotToken{}))
}

func (*RefreshGroupRobotToken) ResponseContent() any {
	return new(github_com_octohelm_kubepkg_pkg_auth.Token)
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&UnbindGroupEnvCluster{}))
}

func (*UnbindGroupEnvCluster) ResponseContent() any {
	return new(github_com_octohelm_kubepkg_internal_dashboard_domain_group.EnvWithCluster)
}
