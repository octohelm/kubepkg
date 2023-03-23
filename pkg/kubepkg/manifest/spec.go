package manifest

import (
	"fmt"
	"strings"

	rbacv1 "k8s.io/api/rbac/v1"

	"github.com/octohelm/kubepkg/pkg/annotation"
	"github.com/octohelm/kubepkg/pkg/kubeutil"

	networkingv1 "k8s.io/api/networking/v1"
	"k8s.io/apimachinery/pkg/util/intstr"

	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	corev1 "k8s.io/api/core/v1"
)

type collector struct {
	manifests map[string]Object
}

func (c *collector) register(o Object) {
	if o == nil || o.GetObjectKind() == nil {
		return
	}
	c.manifests[objectID(o)] = o
}

func (c *collector) walk(kpkg *v1alpha1.KubePkg) error {
	if d := kpkg.Spec.Deploy.Deployer; d != nil {
		ret, err := d.ToResource(kpkg)
		if err != nil {
			return err
		}
		c.register(ret)
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
		service.SetName(v1alpha1.SubResourceName(kpkg, n))

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
			p.Protocol = v1alpha1.PortProtocol(n)
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
						ingress.SetName(v1alpha1.SubResourceName(kpkg, n))

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
	volumes := v1alpha1.VolumesFrom(kpkg)

	for n := range volumes {
		v := volumes[n]

		if v.VolumeSource != nil {
			ret, err := v.VolumeSource.ToResource(kpkg, v1alpha1.SubResourceName(kpkg, n))
			if err != nil {
				return err
			}
			c.register(ret)
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

func objectID(d Object) string {
	return fmt.Sprintf(
		"%s.%s",
		strings.ToLower(d.GetObjectKind().GroupVersionKind().Kind),
		d.GetName(),
	)
}
