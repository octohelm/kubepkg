package cmd

import (
	"context"
	"fmt"
	"github.com/go-logr/logr"
	"github.com/innoai-tech/infra/pkg/cli"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"github.com/octohelm/kubepkg/pkg/kubepkg"
	"github.com/octohelm/kubepkg/pkg/kubepkg/manifest"
	"github.com/octohelm/kubepkg/pkg/kubeutil"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

func init() {
	cli.Add(app, &Apply{})
}

type ApplyFlags struct {
	KubeConfig      string `flag:"kubeconfig" env:"KUBECONFIG" desc:"Paths to a kubeconfig. Only required if out-of-cluster."`
	DryRun          bool   `flag:"dry-run" desc:"Enable dry run"`
	Force           bool   `flag:"force" desc:"Force overwrites ownership"`
	CreateNamespace bool   `flag:"create-namespace" desc:"Create namespace if not exists"`
}

type Apply struct {
	cli.Name `args:"KUBEPKG_JSON" desc:"apply manifests to k8s directly"`
	ApplyFlags
	VerboseFlags
}

func (s *Apply) Run(ctx context.Context) error {
	c, err := kubeutil.NewClient(s.KubeConfig)
	if err != nil {
		return err
	}

	kpkg, err := kubepkg.Load(s.Args[0])
	if err != nil {
		return err
	}

	if s.CreateNamespace {
		if _, err := kubeutil.ApplyNamespace(ctx, kubeutil.KubeConfigFromClient(c), kpkg.Namespace); err != nil {
			return err
		}
	}

	return s.applyKubePkg(ctx, c, kpkg)
}

func (s *Apply) applyKubePkg(ctx context.Context, c client.Client, kpkg *v1alpha1.KubePkg) error {
	l := logr.FromContextOrDiscard(ctx)
	config := kubeutil.KubeConfigFromClient(c)

	l.Info(
		"applying",
		"host", config.Host,
	)

	manifests, err := manifest.ExtractComplete(kpkg)
	if err != nil {
		return err
	}

	options := []client.PatchOption{FieldOwner}

	msgSuffix := "patched"

	if s.DryRun {
		options = append(options, client.DryRunAll)
		msgSuffix += "(dry-run)"
	}

	if s.Force {
		options = append(options, client.ForceOwnership)
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

		l.Info(
			fmt.Sprintf("`%s.%s.%s.%s` %s.", o.GetName(), o.GetNamespace(), gvk.Kind, gvk.GroupVersion(), msgSuffix),
			"host", config.Host,
		)
	}

	return nil
}

var FieldOwner = client.FieldOwner("kubepkg")
