package k8sapply

import (
	"context"
	"fmt"

	"github.com/go-courier/logr"
	kubepkgv1alpha1 "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	"github.com/octohelm/kubepkg/pkg/kubepkg/manifest"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type Apply struct {
	// KubePkg or KubePkgList json file
	KubepkgJSON string `arg:""`
	// Paths to a kubeconfig. Only required if out-of-cluster."
	Kubeconfig string `flag:",omitempty"`
	// Enable dry run
	DryRun bool `flag:",omitempty"`
	// overwrites ownership
	Force bool `flag:",omitempty" `
	// Create namespace if not exists
	CreateNamespace bool `flag:",omitempty" `

	c client.Client
}

func (c *Apply) Init(ctx context.Context) error {
	if c.c != nil {
		return nil
	}
	cl, err := kubeutil.NewClient(c.Kubeconfig)
	if err != nil {
		return err
	}
	c.c = cl
	return nil
}

func (c *Apply) InjectContext(ctx context.Context) context.Context {
	return kubeutil.ContextWithClient(ctx, c.c)
}

func (c *Apply) Run(ctx context.Context) error {
	kpkgs, err := kubepkg.Load(c.KubepkgJSON)
	if err != nil {
		return err
	}

	for i := range kpkgs {
		kpkg := kpkgs[i]

		if c.CreateNamespace {
			if _, err := kubeutil.ApplyNamespace(ctx, kubeutil.KubeConfigFromClient(c.c), kpkg.Namespace); err != nil {
				return err
			}
		}

		options := make([]client.PatchOption, 0)

		if c.DryRun {
			options = append(options, client.DryRunAll)
		}

		if c.Force {
			options = append(options, client.ForceOwnership)
		}

		if err := applyKubePkg(ctx, kpkg, options...); err != nil {
			return err
		}
	}

	return nil
}

func applyKubePkg(ctx context.Context, kpkg *kubepkgv1alpha1.KubePkg, patchOptions ...client.PatchOption) error {
	l := logr.FromContext(ctx)
	c := kubeutil.ClientFromContext(ctx)

	config := kubeutil.KubeConfigFromClient(c)

	l.WithValues("host", config.Host).Info("applying")

	manifests, err := manifest.ExtractComplete(kpkg)
	if err != nil {
		return err
	}

	options := append([]client.PatchOption{kubeutil.FieldOwner}, patchOptions...)

	msgSuffix := "patched"

	for i := range options {
		if options[i] == client.DryRunAll {
			msgSuffix += "(dry-run)"
		}
	}

	for name := range manifests {
		o := manifests[name]

		// skip namespace
		if o.GetObjectKind().GroupVersionKind().Kind == "Namespace" {
			continue
		}

		gvk := o.GetObjectKind().GroupVersionKind()

		if err := c.Patch(ctx, o, client.Apply, options...); err != nil {
			return err
		}

		l.WithValues("host", config.Host).Info(
			fmt.Sprintf("`%s.%s.%s.%s` %s.", o.GetName(), o.GetNamespace(), gvk.Kind, gvk.GroupVersion(), msgSuffix),
		)
	}

	return nil
}
