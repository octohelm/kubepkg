package v1alpha1

import rbacv1 "k8s.io/api/rbac/v1"

type ServiceAccount struct {
	Scope ScopeType           `json:"scope,omitempty"`
	Rules []rbacv1.PolicyRule `json:"rules"`
}

// +gengo:enum
type ScopeType string

const (
	ScopeTypeCluster   ScopeType = "Cluster"
	ScopeTypeNamespace ScopeType = "Namespace"
)
