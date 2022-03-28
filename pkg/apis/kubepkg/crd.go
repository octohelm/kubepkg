package kubepkg

import (
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
)

var CRDs = []*apiextensionsv1.CustomResourceDefinition{
	CustomResourceDefinition(),
}

func CustomResourceDefinition() *apiextensionsv1.CustomResourceDefinition {
	return kubeutil.ToCRD(&kubeutil.CustomResourceDefinition{
		GroupVersion: v1alpha1.SchemeGroupVersion,
		KindType:     &v1alpha1.KubePkg{},
		ListKindType: &v1alpha1.KubePkgList{},
	})
}
