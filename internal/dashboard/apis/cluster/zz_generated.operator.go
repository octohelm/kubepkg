/*
Package cluster GENERATED BY gengo:operator
DON'T EDIT THIS FILE
*/
package cluster

import (
	github_com_octohelm_courier_pkg_courier "github.com/octohelm/courier/pkg/courier"
	github_com_octohelm_kubepkg_internal_dashboard_domain_cluster "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster"
)

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&GetClusterStatus{}))
}

func (*GetClusterStatus) ResponseContent() any {
	return &github_com_octohelm_kubepkg_internal_dashboard_domain_cluster.InstanceStatus{}
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&ListCluster{}))
}

func (*ListCluster) ResponseContent() any {
	return &[]*github_com_octohelm_kubepkg_internal_dashboard_domain_cluster.Cluster{}
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&PutCluster{}))
}

func (*PutCluster) ResponseContent() any {
	return &github_com_octohelm_kubepkg_internal_dashboard_domain_cluster.Cluster{}
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&RenameCluster{}))
}

func (*RenameCluster) ResponseContent() any {
	return &github_com_octohelm_kubepkg_internal_dashboard_domain_cluster.Cluster{}
}
