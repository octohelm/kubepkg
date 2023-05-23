/*
Package blob GENERATED BY gengo:operator
DON'T EDIT THIS FILE
*/
package blob

import (
	github_com_distribution_distribution_v3 "github.com/distribution/distribution/v3"
	github_com_octohelm_courier_pkg_courier "github.com/octohelm/courier/pkg/courier"
	github_com_octohelm_courier_pkg_statuserror "github.com/octohelm/courier/pkg/statuserror"
)

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&StatBlob{}))
}

func (*StatBlob) ResponseContent() any {
	return new(github_com_distribution_distribution_v3.Descriptor)
}

func (*StatBlob) ResponseErrors() []error {
	return []error{
		&(github_com_octohelm_courier_pkg_statuserror.StatusErr{
			Code: 400,
			Key:  "InvalidDigest",
			Msg:  "InvalidDigest",
		}), &(github_com_octohelm_courier_pkg_statuserror.StatusErr{
			Code: 404,
			Key:  "DigestNotFound",
			Msg:  "DigestNotFound",
		}), &(github_com_octohelm_courier_pkg_statuserror.StatusErr{
			Code: 500,
			Key:  "RegistryError",
			Msg:  "RegistryError",
		}),
	}
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&UploadBlob{}))
}

func (*UploadBlob) ResponseContent() any {
	return nil
}

func (*UploadBlob) ResponseErrors() []error {
	return []error{
		&(github_com_octohelm_courier_pkg_statuserror.StatusErr{
			Code: 400,
			Key:  "InvalidContentType",
			Msg:  "InvalidContentType",
		}), &(github_com_octohelm_courier_pkg_statuserror.StatusErr{
			Code: 500,
			Key:  "RegistryError",
			Msg:  "RegistryError",
		}),
	}
}
