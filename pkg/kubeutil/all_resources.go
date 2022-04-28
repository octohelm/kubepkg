package kubeutil

import (
	"context"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/rest"
	"strings"
)

func AllWatchableGroupVersionKinds(ctx context.Context, conf *rest.Config) (gvks []schema.GroupVersionKind, err error) {
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
