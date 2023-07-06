package service

import (
	"context"
	"net/http"

	"k8s.io/apimachinery/pkg/api/resource"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	rbacv1 "k8s.io/api/rbac/v1"

	"github.com/octohelm/courier/pkg/statuserror"
	"github.com/octohelm/kubepkg/internal/dashboard/domain/cluster"
	clusterrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/cluster/repository"
	"github.com/octohelm/kubepkg/pkg/agent"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubepkg/manifest"
	"github.com/octohelm/kubepkg/pkg/version"
	"github.com/octohelm/x/ptr"
	"k8s.io/apimachinery/pkg/util/intstr"
)

func (c *ClusterService) Register(ctx context.Context, agent *agent.Agent) error {
	if err := c.a.Validate(ctx, agent); err != nil {
		return statuserror.Wrap(err, http.StatusUnauthorized, "InvalidAgentToken")
	}

	r := clusterrepository.NewClusterRepository()

	agentInfo := cluster.AgentInfo{}
	agentInfo.Endpoint = agent.Endpoint
	agentInfo.Labels = agent.Labels

	agentSecureInfo := cluster.AgentSecureInfo{}
	agentSecureInfo.OtpKeyURL = agent.OtpKeyURL

	_, err := r.PutAgentInfo(ctx, agent.Name, agentInfo, agentSecureInfo)
	return err
}

func (c *ClusterService) CreateResources(ctx context.Context) ([]manifest.Object, error) {
	accessTokenAsRegistryEndpoint, err := c.a.NewAccessToken(ctx, c.c.Name, agent.AsRegistryEndpoint(true))
	if err != nil {
		return nil, err
	}

	kpkg := createKubePkgAgent(c.c.AgentInfo, accessTokenAsRegistryEndpoint)

	list, err := manifest.ExtractSorted(kpkg)
	if err != nil {
		return nil, err
	}

	n := &corev1.Namespace{}
	n.Kind = "Namespace"
	n.Name = "kube-agent"

	return append([]manifest.Object{n}, list...), nil
}

func createKubePkgAgent(info cluster.AgentInfo, registryEndpoint string) *v1alpha1.KubePkg {
	k := &v1alpha1.KubePkg{}
	k.SetGroupVersionKind(v1alpha1.SchemeGroupVersion.WithKind("KubePkg"))

	k.ObjectMeta.SetName("kubepkg-agent")
	k.ObjectMeta.SetNamespace("kubepkg-agent")

	k.Spec.Version = version.Version()
	k.Spec.Deploy.Deployer = &v1alpha1.DeployDeployment{
		Kind: "Deployment",
		Spec: appsv1.DeploymentSpec{
			Replicas: ptr.Ptr(int32(1)),
		},
	}

	k.Spec.Config = map[string]v1alpha1.EnvVarValueOrFrom{
		"KUBEPKG_AGENT_REGISTRY_ENDPOINT": {
			Value: registryEndpoint,
		},
	}

	probe := &corev1.Probe{
		ProbeHandler: corev1.ProbeHandler{
			HTTPGet: &corev1.HTTPGetAction{
				Path:   "/",
				Port:   intstr.FromInt(32060),
				Scheme: "HTTP",
			},
		},
		InitialDelaySeconds: 5,
		TimeoutSeconds:      1,
		PeriodSeconds:       10,
		SuccessThreshold:    1,
		FailureThreshold:    3,
	}

	k.Spec.Containers = map[string]v1alpha1.Container{}
	k.Spec.Containers["kube-agent"] = v1alpha1.Container{
		Image: v1alpha1.Image{
			Name: "gcr.io/octohelm/kubepkg",
			Tag:  k.Spec.Version,
		},
		Args: []string{
			"serve",
			"agent",
		},
		Env: map[string]v1alpha1.EnvVarValueOrFrom{
			"KUBEPKG_ADDR": {
				Value: ":32060",
			},
		},
		Ports: map[string]int32{
			"http": 32060,
		},
		ReadinessProbe: probe,
		LivenessProbe:  probe,
	}

	k.Spec.Services = map[string]v1alpha1.Service{}
	k.Spec.Services["#"] = v1alpha1.Service{
		Ports: map[string]int32{
			"http": 32060,
		},
		Expose: &v1alpha1.Expose{
			Type: "NodePort",
		},
	}

	k.Spec.Volumes = map[string]v1alpha1.Volume{}
	k.Spec.Volumes["storage"] = v1alpha1.Volume{
		VolumeSource: &v1alpha1.VolumePersistentVolumeClaim{
			Type: "PersistentVolumeClaim",
			Opt: &corev1.PersistentVolumeClaimVolumeSource{
				ClaimName: "storage-kubepkg",
			},
			Spec: corev1.PersistentVolumeClaimSpec{
				StorageClassName: ptr.Ptr("local-path"),
				AccessModes:      []corev1.PersistentVolumeAccessMode{corev1.ReadWriteOnce},
				Resources: corev1.ResourceRequirements{
					Requests: corev1.ResourceList{
						"storage": resource.MustParse("10Gi"),
					},
				},
			},
		},
	}

	k.Spec.ServiceAccount = &v1alpha1.ServiceAccount{
		Scope: v1alpha1.ScopeTypeCluster,
		Rules: []rbacv1.PolicyRule{
			{
				APIGroups: []string{"*"},
				Resources: []string{"*"},
				Verbs:     []string{"*"},
			},
			{
				NonResourceURLs: []string{"*"},
				Verbs:           []string{"*"},
			},
		},
	}

	return k
}
