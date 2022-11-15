package manifest

import (
	"fmt"
	"sort"
	"strings"

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

func ManifestsFromSpec(kpkg *v1alpha1.KubePkg) (map[string]Object, error) {
	if kpkg.Spec.Deploy == nil {
		return map[string]Object{}, nil
	}

	manifests := map[string]Object{}
	register := func(o Object) {
		manifests[objectID(o)] = o
	}

	switch kpkg.Spec.Deploy.Kind {
	case v1alpha1.DeployKindDeployment:
		deployment := &appsv1.Deployment{}
		deployment.SetGroupVersionKind(appsv1.SchemeGroupVersion.WithKind("Deployment"))
		deployment.SetNamespace(kpkg.Namespace)
		deployment.SetName(kpkg.Name)

		podTemplateSpec, err := toPodTemplateSpec(kpkg)
		if err != nil {
			return nil, err
		}

		deployment.Spec.Template = *podTemplateSpec
		deployment.Spec.Selector = &metav1.LabelSelector{
			MatchLabels: deployment.Spec.Template.Labels,
		}
		if len(kpkg.Spec.Deploy.Spec) > 0 {
			if err := kpkg.Spec.Deploy.Spec.DecodeTo(&deployment.Spec); err != nil {
				return nil, err
			}
		}

		register(deployment)

	case v1alpha1.DeployKindDaemonSet:
		daemonSet := &appsv1.DaemonSet{}
		daemonSet.SetGroupVersionKind(appsv1.SchemeGroupVersion.WithKind("DaemonSet"))
		daemonSet.SetNamespace(kpkg.Namespace)
		daemonSet.SetName(kpkg.Name)

		podTemplateSpec, err := toPodTemplateSpec(kpkg)
		if err != nil {
			return nil, err
		}

		daemonSet.Spec.Template = *podTemplateSpec
		daemonSet.Spec.Selector = &metav1.LabelSelector{
			MatchLabels: daemonSet.Spec.Template.Labels,
		}
		if len(kpkg.Spec.Deploy.Spec) > 0 {
			if err := kpkg.Spec.Deploy.Spec.DecodeTo(&daemonSet.Spec); err != nil {
				return nil, err
			}
		}

		register(daemonSet)

	case v1alpha1.DeployKindStatefulSet:
		statefulSet := &appsv1.StatefulSet{}
		statefulSet.SetGroupVersionKind(appsv1.SchemeGroupVersion.WithKind("StatefulSet"))
		statefulSet.SetNamespace(kpkg.Namespace)
		statefulSet.SetName(kpkg.Name)

		podTemplateSpec, err := toPodTemplateSpec(kpkg)
		if err != nil {
			return nil, err
		}

		statefulSet.Spec.Template = *podTemplateSpec
		statefulSet.Spec.Selector = &metav1.LabelSelector{
			MatchLabels: statefulSet.Spec.Template.Labels,
		}
		if len(kpkg.Spec.Deploy.Spec) > 0 {
			if err := kpkg.Spec.Deploy.Spec.DecodeTo(&statefulSet.Spec); err != nil {
				return nil, err
			}
		}

		register(statefulSet)
	}

	volumes := volumesFrom(kpkg)

	for n := range volumes {
		v := volumes[n]

		switch v.Type {
		case "PersistentVolumeClaim":
			persistentVolumeClaim := &corev1.PersistentVolumeClaim{}
			persistentVolumeClaim.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("PersistentVolumeClaim"))
			persistentVolumeClaim.SetNamespace(kpkg.Namespace)
			persistentVolumeClaim.SetName(subResourceName(kpkg, n))

			if err := v.Spec.DecodeTo(&persistentVolumeClaim.Spec); err != nil {
				return nil, err
			}

			register(persistentVolumeClaim)
		case "ConfigMap":
			configMap := &corev1.ConfigMap{}
			configMap.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("ConfigMap"))
			configMap.SetNamespace(kpkg.Namespace)
			configMap.SetName(subResourceName(kpkg, n))

			if err := v.Spec.DecodeTo(&configMap); err != nil {
				return nil, err
			}

			register(configMap)
		case "Secret":
			secret := &corev1.Secret{}
			secret.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("Secret"))
			secret.SetNamespace(kpkg.Namespace)
			secret.SetName(subResourceName(kpkg, n))

			if err := v.Spec.DecodeTo(&secret); err != nil {
				return nil, err
			}

			register(secret)
		}
	}

	if sa := kpkg.Spec.ServiceAccount; sa != nil {
		serviceAccount := &corev1.ServiceAccount{}
		serviceAccount.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("ServiceAccount"))
		serviceAccount.SetNamespace(kpkg.Namespace)
		serviceAccount.SetName(kpkg.Name)

		register(serviceAccount)

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

			register(clusterRole)
			register(clusterRoleBinding)
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

			register(role)
			register(roleBinding)
		}
	}

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

		for n := range s.Ports {
			p := corev1.ServicePort{}
			p.Protocol = portProtocol(n)
			p.Port = s.Ports[n]
			p.Name = n
			p.TargetPort = intstr.FromString(n)
			service.Spec.Ports = append(service.Spec.Ports, p)
		}

		switch s.Expose.Type {
		case "NodePort":
			service.Spec.Type = corev1.ServiceTypeNodePort
			for i, p := range service.Spec.Ports {
				service.Spec.Ports[i].NodePort = p.Port
			}
		case "Ingress":
			if paths := s.Expose.Paths; len(paths) > 0 {
				ingress := &networkingv1.Ingress{}
				ingress.SetGroupVersionKind(networkingv1.SchemeGroupVersion.WithKind("Ingress"))
				ingress.SetNamespace(kpkg.Namespace)
				ingress.SetName(subResourceName(kpkg, n))

				for portName := range paths {
					p := paths[portName]

					pt := networkingv1.PathTypeImplementationSpecific

					r := networkingv1.IngressRule{}
					r.Host = p.Host
					r.HTTP = &networkingv1.HTTPIngressRuleValue{
						Paths: []networkingv1.HTTPIngressPath{
							{
								Path:     p.Path,
								PathType: &pt,
								Backend: networkingv1.IngressBackend{
									Service: &networkingv1.IngressServiceBackend{
										Name: service.Name,
										Port: networkingv1.ServiceBackendPort{
											Name: portName,
										},
									},
								},
							},
						},
					}

					ingress.Spec.Rules = append(ingress.Spec.Rules, r)
				}

				register(ingress)
			}
		}

		register(service)
	}

	patchReload(manifests)

	return manifests, nil
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

	envNames := make([]string, 0, len(c.Env))
	for n := range c.Env {
		envNames = append(envNames, n)
	}
	sort.Strings(envNames)

	for _, n := range envNames {
		envVar := corev1.EnvVar{}
		envVar.Name = n

		envVarValueOrFrom := c.Env[n]

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

		if v.MountPath == "export" {
			if v.Type == "ConfigMap" || v.Type == "Secret" {
				envFrom := corev1.EnvFromSource{
					Prefix: v.Prefix,
				}

				switch v.Type {
				case "ConfigMap":
					envFrom.ConfigMapRef = &corev1.ConfigMapEnvSource{}
					envFrom.ConfigMapRef.Name = subResourceName(kpkg, n)
					envFrom.ConfigMapRef.Optional = v.Optional

					kubeutil.AppendAnnotate(podTemplateSpec, annotation.ReloadConfigMap, envFrom.ConfigMapRef.Name)

				case "Secret":
					envFrom.SecretRef = &corev1.SecretEnvSource{}
					envFrom.SecretRef.Name = subResourceName(kpkg, n)
					envFrom.SecretRef.Optional = v.Optional

					kubeutil.AppendAnnotate(podTemplateSpec, annotation.ReloadSecret, envFrom.SecretRef.Name)
				}

				container.EnvFrom = append(container.EnvFrom, envFrom)
			}
			continue
		}

		volumeMount := corev1.VolumeMount{
			Name:      subResourceName(kpkg, n),
			MountPath: v.MountPath,
			SubPath:   v.SubPath,
			ReadOnly:  v.ReadOnly,
		}

		volume := corev1.Volume{}

		opt := v.Opt
		if opt == nil {
			opt = v1alpha1.SpecObject{}
		}

		so := v1alpha1.SpecObject{
			"name": volumeMount.Name,
			strings.ToLower(v.Type[0:1]) + v.Type[1:]: opt,
		}

		if err := so.DecodeTo(&volume); err != nil {
			return nil, err
		}

		switch v.Type {
		case "ConfigMap":
			volume.ConfigMap.Name = subResourceName(kpkg, n)
			kubeutil.AppendAnnotate(podTemplateSpec, annotation.ReloadConfigMap, volume.ConfigMap.Name)
		case "Secret":
			volume.Secret.SecretName = subResourceName(kpkg, n)
			kubeutil.AppendAnnotate(podTemplateSpec, annotation.ReloadSecret, volume.Secret.SecretName)
		case "PersistentVolumeClaim":
			volume.PersistentVolumeClaim.ClaimName = subResourceName(kpkg, n)
		}

		podTemplateSpec.Spec.Volumes = append(podTemplateSpec.Spec.Volumes, volume)
		container.VolumeMounts = append(container.VolumeMounts, volumeMount)
	}

	return container, nil
}

func volumesFrom(kpkg *v1alpha1.KubePkg) map[string]v1alpha1.Volume {
	volumes := map[string]v1alpha1.Volume{}

	for n := range kpkg.Spec.Volumes {
		volumes[n] = kpkg.Spec.Volumes[n]
	}

	data := map[string]string{}

	for k := range kpkg.Spec.Config {
		data[k] = kpkg.Spec.Config[k]
	}

	volumes["#"] = v1alpha1.Volume{
		MountPath: "export",
		Type:      "Secret",
		Spec: map[string]any{
			"stringData": data,
		},
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
