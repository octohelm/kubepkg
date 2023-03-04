package v1alpha1

import (
	"bytes"
	"encoding/json"

	"github.com/pkg/errors"
	"github.com/tidwall/gjson"
	v1 "k8s.io/api/apps/v1"
	batchv1 "k8s.io/api/batch/v1"
)

type Spec struct {
	Version        string                       `json:"version"`
	Deploy         Deploy                       `json:"deploy,omitempty"`
	Config         map[string]EnvVarValueOrFrom `json:"config,omitempty"`
	Containers     map[string]Container         `json:"containers,omitempty"`
	Volumes        map[string]Volume            `json:"volumes,omitempty"`
	Services       map[string]Service           `json:"services,omitempty"`
	ServiceAccount *ServiceAccount              `json:"serviceAccount,omitempty"`

	Manifests Manifests `json:"manifests,omitempty"`
}

type Manifests map[string]any

type Deploy struct {
	Deployer any `json:"-"`
}

func (d *Deploy) UnmarshalJSON(data []byte) error {
	if len(data) == 0 || bytes.Equal(data, []byte("{}")) || bytes.Equal(data, []byte("null")) {
		return nil
	}

	v := gjson.GetBytes(data, d.Discriminator())

	if t, ok := d.Mapping()[v.Str]; ok {
		if err := json.Unmarshal(data, t); err != nil {
			return err
		}
		d.Deployer = t
		return nil
	}

	return errors.New("Unknown discriminator")
}

func (d Deploy) MarshalJSON() ([]byte, error) {
	if d.Deployer == nil {
		return []byte("{}"), nil
	}
	return json.Marshal(d.Deployer)
}

func (Deploy) Discriminator() string {
	return "kind"
}

func (Deploy) Mapping() map[string]any {
	return map[string]any{
		DeployKindSecret:      &DeploySecret{},
		DeployKindConfigMap:   &DeployConfigMap{},
		DeployKindDeployment:  &DeployDeployment{},
		DeployKindDaemonSet:   &DeployDaemonSet{},
		DeployKindStatefulSet: &DeployStatefulSet{},
		DeployKindJob:         &DeployJob{},
		DeployKindCronJob:     &DeployCronJob{},
	}
}

const (
	DeployKindSecret      = "Secret"
	DeployKindConfigMap   = "ConfigMap"
	DeployKindDeployment  = "Deployment"
	DeployKindDaemonSet   = "DaemonSet"
	DeployKindStatefulSet = "StatefulSet"
	DeployKindJob         = "Job"
	DeployKindCronJob     = "CronJob"
)

type DeploySecret struct {
	Kind        string            `json:"kind" validate:"@string{Secret}"`
	Annotations map[string]string `json:"annotations,omitempty"`
}

type DeployConfigMap struct {
	Kind        string            `json:"kind" validate:"@string{ConfigMap}"`
	Annotations map[string]string `json:"annotations,omitempty"`
}

type DeployDeployment struct {
	Kind        string            `json:"kind" validate:"@string{Deployment}"`
	Annotations map[string]string `json:"annotations,omitempty"`
	Spec        v1.DeploymentSpec `json:"spec,omitempty"`
}

type DeployDaemonSet struct {
	Kind        string            `json:"kind" validate:"@string{DaemonSet}"`
	Annotations map[string]string `json:"annotations,omitempty"`
	Spec        v1.DaemonSetSpec  `json:"spec,omitempty"`
}

type DeployStatefulSet struct {
	Kind        string             `json:"kind" validate:"@string{StatefulSet}"`
	Annotations map[string]string  `json:"annotations,omitempty"`
	Spec        v1.StatefulSetSpec `json:"spec,omitempty"`
}

type DeployJob struct {
	Kind        string            `json:"kind" validate:"@string{Job}"`
	Annotations map[string]string `json:"annotations,omitempty"`
	Spec        batchv1.JobSpec   `json:"spec,omitempty"`
}

type DeployCronJob struct {
	Kind        string              `json:"kind" validate:"@string{CronJob}"`
	Annotations map[string]string   `json:"annotations,omitempty"`
	Spec        batchv1.CronJobSpec `json:"spec,omitempty"`
}
