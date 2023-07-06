package manifest

import "sort"

type SortOrder []string

var InstallOrder SortOrder = []string{
	"Namespace",
	"ResourceQuota",
	"LimitRange",
	"PodSecurityPolicy",
	"Secret",
	"ConfigMap",
	"StorageClass",
	"PersistentVolume",
	"PersistentVolumeClaim",
	"ServiceAccount",
	"CustomResourceDefinition",
	"ClusterRole",
	"ClusterRoleBinding",
	"Role",
	"RoleBinding",
	"Service",
	"DaemonSet",
	"Pod",
	"ReplicationController",
	"ReplicaSet",
	"Deployment",
	"StatefulSet",
	"Job",
	"CronJob",
	"Ingress",
	"APIService",
}

func SortByKind(manifests []Object) []Object {
	ordering := InstallOrder
	ks := newKindSorter(manifests, ordering)
	sort.Sort(ks)
	return ks.manifests
}

func sortByKind(manifests []Object, ordering SortOrder) []Object {
	ks := newKindSorter(manifests, ordering)
	sort.Sort(ks)
	return ks.manifests
}

type kindSorter struct {
	ordering  map[string]int
	manifests []Object
}

func newKindSorter(m []Object, s SortOrder) *kindSorter {
	o := make(map[string]int, len(s))
	for v, k := range s {
		o[k] = v
	}

	return &kindSorter{
		manifests: m,
		ordering:  o,
	}
}

func (k *kindSorter) Len() int { return len(k.manifests) }

func (k *kindSorter) Swap(i, j int) { k.manifests[i], k.manifests[j] = k.manifests[j], k.manifests[i] }

func (k *kindSorter) Less(i, j int) bool {
	a := k.manifests[i]
	b := k.manifests[j]
	first, aok := k.ordering[a.GetObjectKind().GroupVersionKind().Kind]
	second, bok := k.ordering[b.GetObjectKind().GroupVersionKind().Kind]
	if first == second {
		if !aok && !bok && a.GetObjectKind().GroupVersionKind().Kind != b.GetObjectKind().GroupVersionKind().Kind {
			return a.GetObjectKind().GroupVersionKind().Kind < b.GetObjectKind().GroupVersionKind().Kind
		}
		return a.GetName() < b.GetName()
	}
	if !aok {
		return false
	}
	if !bok {
		return true
	}
	return first < second
}
