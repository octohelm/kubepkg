package controller

import (
	"context"
	"fmt"
	"strings"
	"text/template"

	"github.com/octohelm/kubepkg/pkg/annotation"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	corev1 "k8s.io/api/core/v1"
	networkingv1 "k8s.io/api/networking/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"
)

type ServiceReconciler struct {
	ctrl.Manager
	HostOptions HostOptions

	internalHostTemplate *template.Template
}

func (r *ServiceReconciler) SetupWithManager(mgr ctrl.Manager) error {
	r.Manager = mgr
	c := ctrl.NewControllerManagedBy(mgr).
		For(&corev1.Service{}).
		Owns(&corev1.ConfigMap{}).
		Owns(&networkingv1.Ingress{})

	return c.Complete(r)
}

func (r *ServiceReconciler) Reconcile(ctx context.Context, request reconcile.Request) (reconcile.Result, error) {
	l := r.GetLogger().WithName("Service").WithValues("request", request.NamespacedName)

	svc := &corev1.Service{}

	if err := r.GetAPIReader().Get(ctx, request.NamespacedName, svc); err != nil {
		if apierrors.IsNotFound(err) {
			return reconcile.Result{}, nil
		}
		return reconcile.Result{}, err
	}

	manifests := r.getDerivedManifests(svc)
	for i := range manifests {
		m := manifests[i]
		if err := r.applyManifest(ctx, svc, m); err != nil {
			l.Error(err, fmt.Sprintf("%s `%s`: apply dervied-manifest failed", m.GetObjectKind().GroupVersionKind(), m.GetName()))
		}
	}

	return reconcile.Result{}, nil
}

func (r *ServiceReconciler) InternalHost(nn types.NamespacedName) (string, bool) {
	if r.HostOptions.InternalHost == "" {
		return "", false
	}

	if r.internalHostTemplate == nil {
		t, err := template.New("InternalHost").Parse(r.HostOptions.InternalHost)
		if err != nil {
			panic(err)
		}
		r.internalHostTemplate = t
	}

	s := &strings.Builder{}
	_ = r.internalHostTemplate.Execute(s, nn)
	return s.String(), true
}

func (r *ServiceReconciler) getDerivedManifests(svc *corev1.Service) []client.Object {
	manifests := make([]client.Object, 0)

	baseURLs := kubeutil.GetAnnotate(svc, annotation.IngressBaseURL)
	if baseURLs == "" {
		baseURLs = "/"
	}

	hostOptions := r.HostOptions

	nn := types.NamespacedName{
		Namespace: svc.Namespace,
		Name:      svc.Name,
	}

	endpoints := map[string]string{}

	if hosts := kubeutil.GetAnnotate(svc, annotation.IngressHost); hosts != "" {
		for _, host := range strings.Split(hosts, ",") {
			switch host {
			case "internal":
				if hostname, ok := r.InternalHost(nn); ok {
					if inc := r.toIngress(svc, "internal", hostname, strings.Split(baseURLs, ",")); inc != nil {
						manifests = append(manifests, inc)
						endpoints["internal"] = r.Endpoint(hostname)
					}
				}
			case "external":
				if hostname, ok := r.ExternalHost(nn); ok {
					if inc := r.toIngress(svc, "external", hostname, strings.Split(baseURLs, ",")); inc != nil {
						manifests = append(manifests, inc)
						endpoints["external"] = r.Endpoint(hostname)
					}
				}
			}
		}

		if hostOptions.EnableAutoInternalHost && len(svc.Spec.Ports) > 0 {
			if _, ok := endpoints["internal"]; !ok {
				if hostname, ok := r.InternalHost(nn); ok {
					if inc := r.toIngress(svc, "internal", hostname, strings.Split(baseURLs, ",")); inc != nil {
						manifests = append(manifests, inc)
						endpoints["internal"] = r.Endpoint(hostname)
					}
				}
			}
		}
	}

	cm := &corev1.ConfigMap{}
	cm.SetGroupVersionKind(corev1.SchemeGroupVersion.WithKind("ConfigMap"))

	cm.Namespace = svc.Namespace
	cm.Name = "endpoint-" + svc.Name

	kubeutil.Label(cm, annotation.AppEndpoint, svc.Name)
	kubeutil.Annotate(cm, annotation.Reload, "enabled")

	cm.Data = endpoints

	manifests = append(manifests, cm)

	return manifests
}

func (r *ServiceReconciler) toIngress(s *corev1.Service, typ string, hostname string, baseURLs []string) *networkingv1.Ingress {
	ing := &networkingv1.Ingress{}
	ing.SetGroupVersionKind(networkingv1.SchemeGroupVersion.WithKind("Ingress"))

	ing.Namespace = s.Namespace
	ing.Name = s.Name + "-" + typ

	paths := make([]networkingv1.HTTPIngressPath, 0)

	// /path1 /path2
	for i := range baseURLs {
		path := baseURLs[i]
		name := ""

		if len(s.Spec.Ports) > i {
			name = s.Spec.Ports[i].Name
		}

		if name == "" {
			continue
		}

		htp := networkingv1.HTTPIngressPath{}
		pt := networkingv1.PathTypeImplementationSpecific
		htp.PathType = &pt
		htp.Path = path

		htp.Backend.Service = &networkingv1.IngressServiceBackend{
			Name: s.Name,
			Port: networkingv1.ServiceBackendPort{
				Name: name,
			},
		}

		paths = append(paths, htp)
	}

	if len(paths) == 0 {
		return nil
	}

	ing.Spec.Rules = []networkingv1.IngressRule{
		{
			Host: hostname,
			IngressRuleValue: networkingv1.IngressRuleValue{
				HTTP: &networkingv1.HTTPIngressRuleValue{
					Paths: paths,
				},
			},
		},
	}

	return ing
}

func (r *ServiceReconciler) applyManifest(ctx context.Context, s *corev1.Service, o client.Object) error {
	if err := controllerutil.SetControllerReference(s, o, r.GetScheme()); err != nil {
		return err
	}
	return Apply(ctx, r.GetClient(), o)
}

func (r *ServiceReconciler) ExternalHost(nn types.NamespacedName) (string, bool) {
	if r.HostOptions.ExternalHost == "" {
		return "", false
	}

	if r.internalHostTemplate == nil {
		t, err := template.New("ExternalHost").Parse(r.HostOptions.ExternalHost)
		if err != nil {
			panic(err)
		}
		r.internalHostTemplate = t
	}

	s := &strings.Builder{}
	_ = r.internalHostTemplate.Execute(s, nn)
	return s.String(), true
}

func (r *ServiceReconciler) Endpoint(hostname string) string {
	if r.HostOptions.EnableHttps {
		return "https:" + "//" + hostname
	}
	return "http:" + "//" + hostname
}
