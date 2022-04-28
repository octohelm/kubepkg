package controller

import (
	"context"
	"strings"

	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/rest"
)

var FieldOwner = client.FieldOwner("kubepkg")

func allWatchableGroupVersionKinds(conf *rest.Config) (gvks []schema.GroupVersionKind, err error) {
	dc, e := discovery.NewDiscoveryClientForConfig(conf)
	if e != nil {
		return nil, e
	}

	preferredResources, err := dc.ServerPreferredResources()
	if err != nil {
		return nil, err
	}

	for i := range preferredResources {
		pr := preferredResources[i]

		if len(pr.APIResources) == 0 {
			continue
		}

		gv, err := schema.ParseGroupVersion(pr.GroupVersion)
		if err != nil {
			continue
		}

		for _, resource := range pr.APIResources {
			if len(resource.Verbs) == 0 {
				continue
			}

			if strings.Contains(strings.Join(resource.Verbs, ","), "watch") {
				gvks = append(gvks, gv.WithKind(resource.Kind))
			}
		}
	}
	return
}

func GetClientWithoutCache(m ctrl.Manager) client.Client {
	return &clientWithoutCache{Client: m.GetClient(), r: m.GetAPIReader()}
}

type clientWithoutCache struct {
	r client.Reader
	client.Client
}

func (c *clientWithoutCache) Get(ctx context.Context, key client.ObjectKey, obj client.Object) error {
	return c.r.Get(ctx, key, obj)
}

func (c *clientWithoutCache) List(ctx context.Context, key client.ObjectList, opts ...client.ListOption) error {
	return c.r.List(ctx, key, opts...)
}
