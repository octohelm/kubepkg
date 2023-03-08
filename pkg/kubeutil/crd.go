package kubeutil

import (
	"context"
	"encoding/json"
	"reflect"
	"strings"

	"github.com/octohelm/x/ptr"
	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	apiextensionsclientset "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	apiextensionstypesv1 "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset/typed/apiextensions/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/rest"
	"sigs.k8s.io/controller-tools/pkg/crd"
)

type CustomResourceDefinition struct {
	GroupVersion schema.GroupVersion
	KindType     runtime.Object
	ListKindType runtime.Object
	SpecType     any
	Plural       string
	ShortNames   []string
}

func ToCRD(d *CustomResourceDefinition) *apiextensionsv1.CustomResourceDefinition {
	c := &apiextensionsv1.CustomResourceDefinition{}

	kindType := reflect.Indirect(reflect.ValueOf(d.KindType)).Type()

	crdNames := apiextensionsv1.CustomResourceDefinitionNames{
		Kind:       kindType.Name(),
		ListKind:   reflect.Indirect(reflect.ValueOf(d.ListKindType)).Type().Name(),
		ShortNames: d.ShortNames,
	}

	crdNames.Singular = strings.ToLower(crdNames.Kind)

	if d.Plural != "" {
		crdNames.Plural = d.Plural
	} else {
		crdNames.Plural = crdNames.Singular + "s"
	}

	c.Name = crdNames.Plural + "." + d.GroupVersion.Group
	c.Spec.Group = d.GroupVersion.Group
	c.Spec.Scope = apiextensionsv1.NamespaceScoped

	openapiSchema := scanJSONSchema(context.Background(), d.SpecType)

	c.Spec.Names = crdNames
	c.Spec.Versions = []apiextensionsv1.CustomResourceDefinitionVersion{
		{
			Name:    d.GroupVersion.Version,
			Served:  true,
			Storage: true,
			Schema: &apiextensionsv1.CustomResourceValidation{
				OpenAPIV3Schema: openapiSchema,
			},
			Subresources: &apiextensionsv1.CustomResourceSubresources{
				Status: &apiextensionsv1.CustomResourceSubresourceStatus{},
			},
		},
	}

	return c
}

func ApplyCRDs(ctx context.Context, c *rest.Config, crds ...*apiextensionsv1.CustomResourceDefinition) error {
	cs, err := apiextensionsclientset.NewForConfig(c)
	if err != nil {
		return err
	}

	apis := cs.ApiextensionsV1().CustomResourceDefinitions()

	for i := range crds {
		if err := applyCRD(ctx, apis, crds[i]); err != nil {
			return err
		}
	}

	return nil
}

func applyCRD(ctx context.Context, apis apiextensionstypesv1.CustomResourceDefinitionInterface, crd *apiextensionsv1.CustomResourceDefinition) error {
	_, err := apis.Get(ctx, crd.Name, v1.GetOptions{})
	if err != nil {
		if !apierrors.IsNotFound(err) {
			return err
		}
		_, err := apis.Create(ctx, crd, v1.CreateOptions{})
		return err
	}
	data, err := json.Marshal(crd)
	if err != nil {
		return err
	}
	_, err = apis.Patch(ctx, crd.Name, types.MergePatchType, data, v1.PatchOptions{})
	return err
}

func scanJSONSchema(ctx context.Context, v any) *apiextensionsv1.JSONSchemaProps {
	f := &apiextensionsv1.JSONSchemaProps{
		Type: "object",
		Properties: map[string]apiextensionsv1.JSONSchemaProps{
			"spec": {
				XPreserveUnknownFields: ptr.Bool(true),
			},
			"status": {
				XPreserveUnknownFields: ptr.Bool(true),
			},
		},
	}

	return crd.FlattenEmbedded(f, nil)
}
