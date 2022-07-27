/*
Package kubepkg GENERATED BY gengo:operator
DON'T EDIT THIS FILE
*/
package kubepkg

import (
	github_com_octohelm_courier_pkg_courier "github.com/octohelm/courier/pkg/courier"
	github_com_octohelm_courier_pkg_statuserror "github.com/octohelm/courier/pkg/statuserror"
	github_com_octohelm_kubepkg_pkg_apis_kubepkg_v1alpha1 "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
)

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&ApplyKubePkg{}))
}

func (*ApplyKubePkg) ResponseContent() any {
	return &github_com_octohelm_kubepkg_pkg_apis_kubepkg_v1alpha1.KubePkg{}
}

func (*ApplyKubePkg) ResponseErrors() []error {
	return []error{
		&(github_com_octohelm_courier_pkg_statuserror.StatusErr{
			Code: 400,
			Key:  "NoRequestBody",
			Msg:  "NoRequestBody",
		}), &(github_com_octohelm_courier_pkg_statuserror.StatusErr{
			Code: 400,
			Key:  "ReadKubePkgTgzFailed",
			Msg:  "ReadKubePkgTgzFailed",
		}),
	}
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&DelKubePkg{}))
}

func (*DelKubePkg) ResponseContent() any {
	return nil
}

func (*DelKubePkg) ResponseErrors() []error {
	return []error{
		&(github_com_octohelm_courier_pkg_statuserror.StatusErr{
			Code: 500,
			Key:  "RequestK8sFailed",
			Msg:  "RequestK8sFailed",
		}),
	}
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&GetKubePkg{}))
}

func (*GetKubePkg) ResponseContent() any {
	return &github_com_octohelm_kubepkg_pkg_apis_kubepkg_v1alpha1.KubePkg{}
}

func (*GetKubePkg) ResponseErrors() []error {
	return []error{
		&(github_com_octohelm_courier_pkg_statuserror.StatusErr{
			Code: 500,
			Key:  "RequestK8sFailed",
			Msg:  "RequestK8sFailed",
		}),
	}
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&ListKubePkg{}))
}

func (*ListKubePkg) ResponseContent() any {
	return &[]github_com_octohelm_kubepkg_pkg_apis_kubepkg_v1alpha1.KubePkg{}
}

func (*ListKubePkg) ResponseErrors() []error {
	return []error{
		&(github_com_octohelm_courier_pkg_statuserror.StatusErr{
			Code: 500,
			Key:  "RequestK8sFailed",
			Msg:  "RequestK8sFailed",
		}),
	}
}
