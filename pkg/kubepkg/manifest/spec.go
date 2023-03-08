package manifest

import (
	"fmt"
	"sort"
	"strings"

	"github.com/octohelm/kubepkg/pkg/util"

	rbacv1 "k8s.io/api/rbac/v1"

	"github.com/octohelm/kubepkg/pkg/annotation"
	"github.com/octohelm/kubepkg/pkg/kubeutil"

	networkingv1 "k8s.io/api/networking/v1"
	"k8s.io/apimachinery/pkg/util/intstr"

	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/pkg/errors"
	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type collector struct {
	manifests map[string]Object
}

func (c *collector) register(o Object) {
	c.manifests[objectID(o)] = o
}

func (c *collector) patchReloadAnnotation(o Object, spec *corev1.PodTemplateSpec) {
	for k := range spec.Annotations {
		switch k {
		case annotation.ReloadConfigMap:
			kubeutil.AppendAnnotate(o, k, spec.Annotations[k])
		case annotation.ReloadSecret:
			kubeutil.AppendAnnotate(o, k, spec.Annotations[k])
		}
	}
}

func (c *collector) configDataFrom(tpe string, config map[string]v1alpha1.EnvVarValueOrFrom) (map[string]string, error) {
	values := map[string]string{}
	for k := range config {
		if config[k].ValueFrom != nil {
			return nil, fmt.Errorf("config.%q: ref value is not support", k)
		}
		values[k] = config[k].Value
	}

	switch tpe {
	case "database":
		conf := &ConfigurationDatabase{}
		conf.Name = values["name"]
		conf.Scheme = values["scheme"]
		conf.Host = values["host"]
		conf.Username = values["username"]
		conf.Password = values["password"]
		conf.Extra = values["extra"]

		values["endpoint"] = conf.Endpoint()
	}

	return values, nil
}

func (c *collector) walk(kpkg *v1alpha1.KubePkg) error {
	switch x := kpkg.Spec.Deploy.Deployer.(type) {
	case *v1alpha1.DeploySecret:
		secret := &corev1.Secret{}
		secret.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("Secret"))
		secret.SetNamespace(kpkg.Namespace)
		secret.SetName(kpkg.Name)

		configurationType := ""
		if x.Annotations != nil {
			if ct, ok := x.Annotations["configuration.octohelm.tech/type"]; ok {
				configurationType = ct
			}
		}

		data, err := c.configDataFrom(configurationType, kpkg.Spec.Config)
		if err != nil {
			return err
		}

		secret.StringData = data
		c.register(secret)
	case *v1alpha1.DeployConfigMap:
		configMap := &corev1.ConfigMap{}
		configMap.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("ConfigMap"))
		configMap.SetNamespace(kpkg.Namespace)
		configMap.SetName(kpkg.Name)

		configurationType := ""
		if x.Annotations != nil {
			if ct, ok := x.Annotations["configuration.octohelm.tech/type"]; ok {
				configurationType = ct
			}
		}
		data, err := c.configDataFrom(configurationType, kpkg.Spec.Config)
		if err != nil {
			return err
		}
		configMap.Data = data
		c.register(configMap)
	case *v1alpha1.DeployDeployment:
		deployment := &appsv1.Deployment{}
		deployment.SetGroupVersionKind(appsv1.SchemeGroupVersion.WithKind("Deployment"))
		deployment.SetNamespace(kpkg.Namespace)
		deployment.SetName(kpkg.Name)

		podTemplateSpec, err := toPodTemplateSpec(kpkg)
		if err != nil {
			return err
		}

		deployment.Spec.Template = *podTemplateSpec
		deployment.Spec.Selector = &metav1.LabelSelector{
			MatchLabels: deployment.Spec.Template.Labels,
		}

		spec, err := util.Merge(&deployment.Spec, &x.Spec)
		if err != nil {
			return err
		}
		deployment.Spec = *spec

		c.patchReloadAnnotation(deployment, podTemplateSpec)
		c.register(deployment)

	case *v1alpha1.DeployDaemonSet:
		daemonSet := &appsv1.DaemonSet{}
		daemonSet.SetGroupVersionKind(appsv1.SchemeGroupVersion.WithKind("DaemonSet"))
		daemonSet.SetNamespace(kpkg.Namespace)
		daemonSet.SetName(kpkg.Name)

		podTemplateSpec, err := toPodTemplateSpec(kpkg)
		if err != nil {
			return err
		}

		daemonSet.Spec.Template = *podTemplateSpec
		daemonSet.Spec.Selector = &metav1.LabelSelector{
			MatchLabels: daemonSet.Spec.Template.Labels,
		}

		spec, err := util.Merge(&daemonSet.Spec, &x.Spec)
		if err != nil {
			return err
		}
		daemonSet.Spec = *spec

		c.patchReloadAnnotation(daemonSet, podTemplateSpec)
		c.register(daemonSet)

	case *v1alpha1.DeployStatefulSet:
		statefulSet := &appsv1.StatefulSet{}
		statefulSet.SetGroupVersionKind(appsv1.SchemeGroupVersion.WithKind("StatefulSet"))
		statefulSet.SetNamespace(kpkg.Namespace)
		statefulSet.SetName(kpkg.Name)

		podTemplateSpec, err := toPodTemplateSpec(kpkg)
		if err != nil {
			return err
		}

		statefulSet.Spec.Template = *podTemplateSpec
		statefulSet.Spec.Selector = &metav1.LabelSelector{
			MatchLabels: statefulSet.Spec.Template.Labels,
		}

		spec, err := util.Merge(&statefulSet.Spec, &x.Spec)
		if err != nil {
			return err
		}
		statefulSet.Spec = *spec

		c.patchReloadAnnotation(statefulSet, podTemplateSpec)
		c.register(statefulSet)
	}

	if err := c.walkVolumes(kpkg); err != nil {
		return err
	}

	if err := c.walkNetworks(kpkg); err != nil {
		return err
	}

	if err := c.walkRbac(kpkg); err != nil {
		return err
	}

	return nil
}

func (c *collector) walkNetworks(kpkg *v1alpha1.KubePkg) error {
	ingressGateway := kubeutil.GetAnnotate(kpkg, annotation.IngressGateway)

	for n := range kpkg.Spec.Services {
		s := kpkg.Spec.Services[n]

		service := &corev1.Service{}
		service.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("Service"))
		service.SetNamespace(kpkg.Namespace)
		service.SetName(subResourceName(kpkg, n))

		service.Spec.Selector = map[string]string{
			"app": kpkg.Name,
		}

		service.Spec.ClusterIP = s.ClusterIP

		paths := map[string]string{}
		for portName, p := range s.Paths {
			paths[portName] = p
		}

		for n := range s.Ports {
			p := corev1.ServicePort{}
			p.Protocol = portProtocol(n)
			p.Port = s.Ports[n]
			p.Name = n
			p.TargetPort = intstr.FromString(n)
			service.Spec.Ports = append(service.Spec.Ports, p)

			if strings.HasPrefix(p.Name, "http") {
				if _, ok := paths[p.Name]; !ok {
					paths[p.Name] = "/"
				}
			}
		}

		var igs *IngressGatewaySet
		endpoints := map[string]string{}

		if n == "#" && ingressGateway != "" {
			i, err := ParseIngressGatewaySet(ingressGateway)
			if err != nil {
				return err
			}
			igs = i

			if len(paths) > 0 && s.Expose == nil {
				s.Expose = &v1alpha1.Expose{
					Type: "Ingress",
				}
			}
		}

		if s.Expose == nil || s.Expose.Type != "NodePort" {
			endpoints["default"] = fmt.Sprintf("http://%s", service.Name)
		}

		if s.Expose != nil {
			switch s.Expose.Type {
			case "NodePort":
				service.Spec.Type = corev1.ServiceTypeNodePort
				for i, p := range service.Spec.Ports {
					service.Spec.Ports[i].NodePort = p.Port
				}
			case "Ingress":
				if igs != nil {
					rules := igs.For(service.Name, service.Namespace).IngressRules(paths, s.Expose.Gateway...)

					for name, e := range igs.For(service.Name, service.Namespace).Endpoints() {
						endpoints[name] = e
					}

					if len(rules) > 0 {
						ingress := &networkingv1.Ingress{}
						ingress.SetGroupVersionKind(networkingv1.SchemeGroupVersion.WithKind("Ingress"))
						ingress.SetNamespace(kpkg.Namespace)
						ingress.SetName(subResourceName(kpkg, n))

						ingress.Spec.Rules = rules

						c.register(ingress)
					}
				}
			}
		}

		c.register(service)

		if len(endpoints) > 0 {
			cmForEndpoints := &corev1.ConfigMap{}
			cmForEndpoints.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("ConfigMap"))
			cmForEndpoints.SetNamespace(service.Namespace)
			cmForEndpoints.SetName(fmt.Sprintf("endpoint-%s", service.Name))
			cmForEndpoints.Data = endpoints

			c.register(cmForEndpoints)
		}
	}

	return nil
}

func (c *collector) walkVolumes(kpkg *v1alpha1.KubePkg) error {
	volumes := volumesFrom(kpkg)

	for n := range volumes {
		v := volumes[n]

		switch x := v.VolumeSource.(type) {
		case *v1alpha1.VolumePersistentVolumeClaim:
			persistentVolumeClaim := &corev1.PersistentVolumeClaim{}
			persistentVolumeClaim.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("PersistentVolumeClaim"))
			persistentVolumeClaim.SetNamespace(kpkg.Namespace)
			persistentVolumeClaim.SetName(subResourceName(kpkg, n))

			spec, err := util.Merge(&persistentVolumeClaim.Spec, &x.Spec)
			if err != nil {
				return err
			}
			persistentVolumeClaim.Spec = *spec

			c.register(persistentVolumeClaim)
		case *v1alpha1.VolumeConfigMap:
			configMap := &corev1.ConfigMap{}
			configMap.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("ConfigMap"))
			configMap.SetNamespace(kpkg.Namespace)
			configMap.SetName(subResourceName(kpkg, n))

			if spec := x.Spec; spec != nil {
				configMap.Data = spec.Data
			}

			c.register(configMap)
		case *v1alpha1.VolumeSecret:
			secret := &corev1.Secret{}
			secret.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("Secret"))
			secret.SetNamespace(kpkg.Namespace)
			secret.SetName(subResourceName(kpkg, n))

			if spec := x.Spec; spec != nil {
				secret.StringData = spec.Data
			}

			c.register(secret)
		}
	}

	return nil
}

func (c *collector) walkRbac(kpkg *v1alpha1.KubePkg) error {
	if sa := kpkg.Spec.ServiceAccount; sa != nil {
		serviceAccount := &corev1.ServiceAccount{}
		serviceAccount.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("ServiceAccount"))
		serviceAccount.SetNamespace(kpkg.Namespace)
		serviceAccount.SetName(kpkg.Name)

		c.register(serviceAccount)

		if sa.Scope == v1alpha1.ScopeTypeCluster {
			clusterRole := &rbacv1.ClusterRole{}
			clusterRole.SetGroupVersionKind(rbacv1.SchemeGroupVersion.WithKind("ClusterRole"))
			clusterRole.SetNamespace(kpkg.Namespace)
			clusterRole.SetName(kpkg.Name)
			clusterRole.Rules = sa.Rules

			clusterRoleBinding := &rbacv1.ClusterRoleBinding{}
			clusterRoleBinding.SetGroupVersionKind(rbacv1.SchemeGroupVersion.WithKind("ClusterRoleBinding"))
			clusterRoleBinding.SetNamespace(kpkg.Namespace)
			clusterRoleBinding.SetName(kpkg.Name)

			clusterRoleBinding.RoleRef.Name = clusterRole.Name
			clusterRoleBinding.RoleRef.Kind = clusterRole.Kind
			clusterRoleBinding.RoleRef.APIGroup = rbacv1.SchemeGroupVersion.Group

			clusterRoleBinding.Subjects = []rbacv1.Subject{{
				Kind:      serviceAccount.Kind,
				Name:      serviceAccount.Name,
				Namespace: serviceAccount.Namespace,
			}}

			c.register(clusterRole)
			c.register(clusterRoleBinding)
		} else {
			role := &rbacv1.Role{}
			role.SetGroupVersionKind(rbacv1.SchemeGroupVersion.WithKind("Role"))
			role.SetNamespace(kpkg.Namespace)
			role.SetName(kpkg.Name)
			role.Rules = sa.Rules

			roleBinding := &rbacv1.RoleBinding{}
			roleBinding.SetGroupVersionKind(rbacv1.SchemeGroupVersion.WithKind("RoleBinding"))
			roleBinding.SetNamespace(kpkg.Namespace)
			roleBinding.SetName(kpkg.Name)

			roleBinding.RoleRef.Name = role.Name
			roleBinding.RoleRef.Kind = role.Kind
			roleBinding.RoleRef.APIGroup = rbacv1.SchemeGroupVersion.Group

			roleBinding.Subjects = []rbacv1.Subject{{
				Kind:      serviceAccount.Kind,
				Name:      serviceAccount.Name,
				Namespace: serviceAccount.Namespace,
			}}

			c.register(role)
			c.register(roleBinding)
		}
	}

	return nil
}

func ManifestsFromSpec(kpkg *v1alpha1.KubePkg) (map[string]Object, error) {
	if kpkg.Spec.Deploy.Deployer == nil {
		return map[string]Object{}, nil
	}
	c := &collector{manifests: map[string]Object{}}
	if err := c.walk(kpkg); err != nil {
		return nil, err
	}
	return c.manifests, nil
}

func toPodTemplateSpec(kpkg *v1alpha1.KubePkg) (*corev1.PodTemplateSpec, error) {
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

func subResourceName(kpkg *v1alpha1.KubePkg, name string) string {
	if name == "#" || name == "" {
		return kpkg.Name
	}
	if name[0] == '~' || name[0] == '/' {
		return name[1:]
	}
	return strings.Join([]string{kpkg.Name, name}, "-")
}

func toContainer(c v1alpha1.Container, name string, podTemplateSpec *corev1.PodTemplateSpec, kpkg *v1alpha1.KubePkg) (*corev1.Container, error) {
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

	envs := make(map[string]v1alpha1.EnvVarValueOrFrom)

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
		p.Protocol = portProtocol(name)

		container.Ports = append(container.Ports, p)
	}

	volumes := volumesFrom(kpkg)

	for n := range volumes {
		v := volumes[n]

		volume := corev1.Volume{}

		switch x := v.VolumeSource.(type) {
		case *v1alpha1.VolumeConfigMap:
			volume.ConfigMap = x.Opt
			if volume.ConfigMap == nil {
				volume.ConfigMap = &corev1.ConfigMapVolumeSource{}
			}

			volume.ConfigMap.Name = subResourceName(kpkg, n)

			kubeutil.AppendAnnotate(podTemplateSpec, annotation.ReloadConfigMap, volume.ConfigMap.Name)

			volumeMount := corev1.VolumeMount{
				Name: subResourceName(kpkg, n),
			}

			if x.MountPath == "export" {
				envFrom := corev1.EnvFromSource{
					Prefix: x.Prefix,
				}
				envFrom.ConfigMapRef = &corev1.ConfigMapEnvSource{}
				envFrom.ConfigMapRef.Name = subResourceName(kpkg, n)
				envFrom.ConfigMapRef.Optional = x.Optional

				container.EnvFrom = append(container.EnvFrom, envFrom)
				kubeutil.AppendAnnotate(podTemplateSpec, annotation.ReloadConfigMap, envFrom.ConfigMapRef.Name)
			} else {
				volumeMount.MountPath = x.MountPath
				volumeMount.SubPath = x.SubPath
				volumeMount.ReadOnly = x.ReadOnly

				container.VolumeMounts = append(container.VolumeMounts, volumeMount)
				volume.Name = volumeMount.Name
			}
		case *v1alpha1.VolumeSecret:
			volume.Secret = x.Opt
			if volume.Secret == nil {
				volume.Secret = &corev1.SecretVolumeSource{}
			}
			volume.Secret.SecretName = subResourceName(kpkg, n)
			kubeutil.AppendAnnotate(podTemplateSpec, annotation.ReloadSecret, volume.Secret.SecretName)

			volumeMount := corev1.VolumeMount{
				Name: subResourceName(kpkg, n),
			}

			if volumeMount.MountPath == "export" {
				envFrom := corev1.EnvFromSource{
					Prefix: x.Prefix,
				}
				envFrom.SecretRef = &corev1.SecretEnvSource{}
				envFrom.SecretRef.Name = subResourceName(kpkg, n)
				envFrom.SecretRef.Optional = x.Optional

				container.EnvFrom = append(container.EnvFrom, envFrom)
				kubeutil.AppendAnnotate(podTemplateSpec, annotation.ReloadSecret, envFrom.SecretRef.Name)
			} else {
				volumeMount.MountPath = x.MountPath
				volumeMount.SubPath = x.SubPath
				volumeMount.ReadOnly = x.ReadOnly

				container.VolumeMounts = append(container.VolumeMounts, volumeMount)
				volume.Name = volumeMount.Name
			}
		case *v1alpha1.VolumePersistentVolumeClaim:
			if x.MountPath == "export" {
				// not support export
			} else {
				volumeMount := corev1.VolumeMount{
					Name: subResourceName(kpkg, n),
				}

				volumeMount.MountPath = x.MountPath
				volumeMount.SubPath = x.SubPath
				volumeMount.ReadOnly = x.ReadOnly

				volume.PersistentVolumeClaim = x.Opt
				volume.PersistentVolumeClaim.ClaimName = subResourceName(kpkg, n)

				container.VolumeMounts = append(container.VolumeMounts, volumeMount)
				volume.Name = volumeMount.Name
			}
		default:
			return nil, errors.Errorf("invalid volume source %T", x)
		}

		if volume.Name != "" {
			addToSpecVolume(podTemplateSpec, volume)
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

func volumesFrom(kpkg *v1alpha1.KubePkg) map[string]v1alpha1.Volume {
	volumes := map[string]v1alpha1.Volume{}

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
	case *v1alpha1.VolumeSecret, *v1alpha1.VolumeConfigMap:
	default:
		volumes["#"] = v1alpha1.Volume{
			VolumeSource: &v1alpha1.VolumeConfigMap{
				Type: "ConfigMap",
				Spec: &v1alpha1.SpecData{
					Data: data,
				},
				VolumeMount: v1alpha1.VolumeMount{
					MountPath: "export",
				},
			},
		}
	}

	return volumes
}

func objectID(d Object) string {
	return fmt.Sprintf(
		"%s.%s",
		strings.ToLower(d.GetObjectKind().GroupVersionKind().Kind),
		d.GetName(),
	)
}

func portProtocol(n string) corev1.Protocol {
	if strings.HasPrefix(n, "udp-") {
		return corev1.ProtocolUDP
	} else if strings.HasPrefix(n, "sctp-") {
		return corev1.ProtocolSCTP
	} else {
		return corev1.ProtocolTCP
	}
}
