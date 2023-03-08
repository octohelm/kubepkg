package v1alpha1

import (
	"bytes"
	"encoding/json"
	"sort"
	"strings"

	"github.com/octohelm/kubepkg/pkg/annotation"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	"github.com/pkg/errors"
	"github.com/tidwall/gjson"
	corev1 "k8s.io/api/core/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type Deploy struct {
	Deployer `json:"-"`
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
		d.Deployer = t.(Deployer)
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
		"Secret":      Deployer(&DeploySecret{}),
		"ConfigMap":   Deployer(&DeployConfigMap{}),
		"Deployment":  Deployer(&DeployDeployment{}),
		"DaemonSet":   Deployer(&DeployDaemonSet{}),
		"StatefulSet": Deployer(&DeployStatefulSet{}),
		"Job":         Deployer(&DeployJob{}),
		"CronJob":     Deployer(&DeployCronJob{}),
	}
}

type Deployer interface {
	ToResource(kpkg *KubePkg) (client.Object, error)
}

func patchReloadAnnotation(o client.Object, spec *corev1.PodTemplateSpec) {
	for k := range spec.Annotations {
		switch k {
		case annotation.ReloadConfigMap:
			kubeutil.AppendAnnotate(o, k, spec.Annotations[k])
		case annotation.ReloadSecret:
			kubeutil.AppendAnnotate(o, k, spec.Annotations[k])
		}
	}
}

func toPodTemplateSpec(kpkg *KubePkg) (*corev1.PodTemplateSpec, error) {
	if len(kpkg.Spec.Containers) == 0 {
		return nil, errors.New("containers should not empty")
	}
	template := &corev1.PodTemplateSpec{}
	if template.Labels == nil {
		template.Labels = map[string]string{}
	}
	template.Labels["app"] = kpkg.Name

	initContainerNames := make([]string, 0, len(kpkg.Spec.Containers))
	containerNames := make([]string, 0, len(kpkg.Spec.Containers))
	finalPlatforms := []string{"linux/amd64", "linux/arm64"}

	for name, c := range kpkg.Spec.Containers {
		if platforms := c.Image.Platforms; len(platforms) > 0 {
			finalPlatforms = kubeutil.Intersection(finalPlatforms, platforms)
		}

		if strings.HasPrefix(name, "init-") {
			initContainerNames = append(initContainerNames, name)
			continue
		}

		containerNames = append(containerNames, name)
	}

	sort.Strings(initContainerNames)
	sort.Strings(containerNames)

	for _, name := range initContainerNames {
		c, err := toContainer(kpkg.Spec.Containers[name], name, template, kpkg)
		if err != nil {
			return nil, err
		}
		template.Spec.InitContainers = append(template.Spec.InitContainers, *c)
	}
	for _, name := range containerNames {
		c, err := toContainer(kpkg.Spec.Containers[name], name, template, kpkg)
		if err != nil {
			return nil, err
		}
		template.Spec.Containers = append(template.Spec.Containers, *c)
	}

	if kpkg.Spec.ServiceAccount != nil {
		template.Spec.ServiceAccountName = kpkg.Name
	}

	if len(finalPlatforms) > 0 {
		arch := make([]string, 0, len(finalPlatforms))

		for _, p := range finalPlatforms {
			parts := strings.Split(p, "/")
			if len(parts) >= 2 {
				arch = append(arch, parts[1])
			}
		}

		template.Spec.Affinity = must(template.Spec.Affinity)
		template.Spec.Affinity.NodeAffinity = must(template.Spec.Affinity.NodeAffinity)
		template.Spec.Affinity.NodeAffinity.RequiredDuringSchedulingIgnoredDuringExecution = must(template.Spec.Affinity.NodeAffinity.RequiredDuringSchedulingIgnoredDuringExecution)
		template.Spec.Affinity.NodeAffinity.RequiredDuringSchedulingIgnoredDuringExecution.NodeSelectorTerms = append(
			template.Spec.Affinity.NodeAffinity.RequiredDuringSchedulingIgnoredDuringExecution.NodeSelectorTerms,
			corev1.NodeSelectorTerm{
				MatchExpressions: []corev1.NodeSelectorRequirement{{
					Key:      "kubernetes.io/arch",
					Operator: "In",
					Values:   arch,
				}},
			},
		)
	}

	return template, nil
}

func SubResourceName(kpkg *KubePkg, name string) string {
	if name == "#" || name == "" {
		return kpkg.Name
	}
	if name[0] == '~' || name[0] == '/' {
		return name[1:]
	}
	return strings.Join([]string{kpkg.Name, name}, "-")
}

func toContainer(c Container, name string, podTemplateSpec *corev1.PodTemplateSpec, kpkg *KubePkg) (*corev1.Container, error) {
	container := &corev1.Container{}
	container.Name = name

	container.Image = c.Image.FullName()
	container.ImagePullPolicy = c.Image.PullPolicy

	container.WorkingDir = c.WorkingDir
	container.Command = c.Command
	container.Args = c.Args

	container.Stdin = c.Stdin
	container.StdinOnce = c.StdinOnce
	container.TTY = c.TTY

	if resources := c.Resources; resources != nil {
		container.Resources = *resources
	}

	container.LivenessProbe = c.LivenessProbe
	container.ReadinessProbe = c.ReadinessProbe
	container.StartupProbe = c.StartupProbe
	container.Lifecycle = c.Lifecycle

	container.SecurityContext = c.SecurityContext

	container.TerminationMessagePath = c.TerminationMessagePath
	container.TerminationMessagePolicy = c.TerminationMessagePolicy

	envs := make(map[string]EnvVarValueOrFrom)

	for k := range kpkg.Spec.Config {
		if kpkg.Spec.Config[k].ValueFrom != nil {
			envs[k] = kpkg.Spec.Config[k]
		}
	}

	for k := range c.Env {
		envs[k] = c.Env[k]
	}

	envNames := make([]string, 0, len(envs))
	for n := range envs {
		envNames = append(envNames, n)
	}
	sort.Strings(envNames)

	for _, n := range envNames {
		envVar := corev1.EnvVar{}
		envVar.Name = n
		envVarValueOrFrom := envs[n]

		if envVarValueOrFrom.ValueFrom != nil {
			envVar.ValueFrom = envVarValueOrFrom.ValueFrom
		} else {
			envVar.Value = envVarValueOrFrom.Value
		}

		container.Env = append(container.Env, envVar)
	}

	portNames := make([]string, 0, len(c.Ports))
	for n := range c.Ports {
		portNames = append(portNames, n)
	}
	sort.Strings(portNames)

	for _, n := range portNames {
		p := corev1.ContainerPort{}
		p.ContainerPort = c.Ports[n]
		p.Name = n
		p.Protocol = PortProtocol(name)

		container.Ports = append(container.Ports, p)
	}

	volumes := VolumesFrom(kpkg)

	for n := range volumes {
		v := volumes[n]

		if v.VolumeSource != nil {
			ret := v.VolumeSource.Mount(SubResourceName(kpkg, n))

			if ret.VolumeMount != nil {
				container.VolumeMounts = append(container.VolumeMounts, *ret.VolumeMount)
			}

			if ret.EnvFromSource != nil {
				container.EnvFrom = append(container.EnvFrom, *ret.EnvFromSource)
			}

			if ret.Reload != "" {
				kubeutil.AppendAnnotate(podTemplateSpec, ret.Reload, ret.ResourceName)
			}

			if ret.Volume != nil {
				addToSpecVolume(podTemplateSpec, *ret.Volume)
			}
		}
	}

	return container, nil
}

func addToSpecVolume(podTemplateSpec *corev1.PodTemplateSpec, volume corev1.Volume) {
	added := false
	for _, vol := range podTemplateSpec.Spec.Volumes {
		if vol.Name == volume.Name {
			added = true
			break
		}
	}
	if !added {
		podTemplateSpec.Spec.Volumes = append(podTemplateSpec.Spec.Volumes, volume)
	}
}

func VolumesFrom(kpkg *KubePkg) map[string]Volume {
	volumes := map[string]Volume{}

	for n := range kpkg.Spec.Volumes {
		volumes[n] = kpkg.Spec.Volumes[n]
	}

	data := map[string]string{}

	for k, c := range kpkg.Spec.Config {
		if c.ValueFrom == nil {
			data[k] = c.Value
		}
	}

	switch kpkg.Spec.Deploy.Deployer.(type) {
	case *DeploySecret, *DeployConfigMap:
	default:
		volumes["#"] = Volume{
			VolumeSource: &VolumeConfigMap{
				Type: "ConfigMap",
				Spec: &SpecData{
					Data: data,
				},
				VolumeMount: VolumeMount{
					MountPath: "export",
				},
			},
		}
	}

	return volumes
}

func PortProtocol(n string) corev1.Protocol {
	if strings.HasPrefix(n, "udp-") {
		return corev1.ProtocolUDP
	} else if strings.HasPrefix(n, "sctp-") {
		return corev1.ProtocolSCTP
	} else {
		return corev1.ProtocolTCP
	}
}

func must[T any](v *T) *T {
	if v == nil {
		v = new(T)
	}
	return v
}
