package controller

import (
	kubepkgv1alpha1 "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	appsv1 "k8s.io/api/apps/v1"
	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"
	networksv1 "k8s.io/api/networking/v1"
	rbacv1 "k8s.io/api/rbac/v1"
	"k8s.io/apimachinery/pkg/runtime"
	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

func IsSupportedGroupKind(o client.Object) bool {
	gvk := o.GetObjectKind().GroupVersionKind()
	if kinds, ok := supportedGroupKinds[gvk.Group]; ok {
		if _, ok := kinds[gvk.Kind]; ok {
			return true
		}
	}
	return false
}

func init() {
	scheme := runtime.NewScheme()
	utilruntime.Must(clientgoscheme.AddToScheme(scheme))
	utilruntime.Must(kubepkgv1alpha1.AddToScheme(scheme))

	for _, s := range supported {
		gvks, _, _ := scheme.ObjectKinds(s)
		if len(gvks) > 0 {
			gvk := gvks[0]
			if supportedGroupKinds[gvk.Group] == nil {
				supportedGroupKinds[gvk.Group] = map[string]bool{}
			}
			supportedGroupKinds[gvk.Group][gvk.Kind] = true
		}
	}
}

var supportedGroupKinds = map[string]map[string]bool{}

var supported = []client.Object{
	&corev1.PersistentVolumeClaim{},

	&corev1.Service{},
	&networksv1.Ingress{},

	&corev1.Secret{},
	&corev1.ConfigMap{},

	&appsv1.Deployment{},
	&appsv1.DaemonSet{},
	&appsv1.StatefulSet{},

	&batchv1.Job{},
	&batchv1.CronJob{},

	&corev1.ServiceAccount{},
	&rbacv1.ClusterRole{},
	&rbacv1.ClusterRoleBinding{},
	&rbacv1.Role{},
	&rbacv1.RoleBinding{},

	&kubepkgv1alpha1.KubePkg{},
}
