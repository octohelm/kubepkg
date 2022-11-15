package v1alpha1

import (
	"encoding/json"

	"sigs.k8s.io/yaml"
)

type Spec struct {
	Version        string               `json:"version"`
	Deploy         *Deploy              `json:"deploy,omitempty"`
	Config         map[string]string    `json:"config,omitempty"`
	Containers     map[string]Container `json:"containers,omitempty"`
	Volumes        map[string]Volume    `json:"volumes,omitempty"`
	Services       map[string]Service   `json:"services,omitempty"`
	ServiceAccount *ServiceAccount      `json:"serviceAccount,omitempty"`

	Manifests Manifests `json:"manifests,omitempty"`
}

type Manifests map[string]any

type Deploy struct {
	Kind DeployKind `json:"kind"`
	Spec SpecObject `json:"spec,omitempty"`
}

// +gengo:enum
type DeployKind string

const (
	DeployKindDeployment  DeployKind = "Deployment"
	DeployKindDaemonSet   DeployKind = "DaemonSet"
	DeployKindStatefulSet DeployKind = "StatefulSet"
	DeployKindJob         DeployKind = "Job"
	DeployKindCronJob     DeployKind = "CronJob"
)

type SpecObject map[string]any

func (o SpecObject) DecodeTo(v any) error {
	data, err := json.Marshal(o)
	if err != nil {
		return err
	}
	if err := yaml.Unmarshal(data, v); err != nil {
		return err
	}
	return nil
}
