package manifest

import (
	"bytes"
	"fmt"
	"net/url"
	"strings"
	"text/template"

	"github.com/pkg/errors"

	"github.com/octohelm/x/ptr"
	networkingv1 "k8s.io/api/networking/v1"
)

// ParseIngressGatewaySet
//
// example:
//
//	public+https://{{ .Name }}.public
//	internal+https://{{ .Name }}---{{ .Namespace }}.internal?always=true
func ParseIngressGatewaySet(v string) (*IngressGatewaySet, error) {
	s := &IngressGatewaySet{
		gateways: map[string]GatewayTemplate{},
	}

	for _, r := range strings.Split(v, ",") {
		if r == "" {
			continue
		}

		t, err := ParseGatewayTemplate(r)
		if err != nil {
			return nil, err
		}
		s.gateways[t.Name] = *t
	}

	return s, nil
}

func ParseGatewayTemplate(t string) (*GatewayTemplate, error) {
	parts := strings.Split(t, "://")
	if len(parts) == 2 {
		gt := &GatewayTemplate{}
		gt.Name = strings.Split(parts[0], "+")[0]
		gt.Https = strings.HasSuffix(parts[0], "https")

		hostAndParams := strings.Split(parts[1], "?")

		if len(hostAndParams) > 1 {
			params, err := url.ParseQuery(hostAndParams[1])
			if err != nil {
				return nil, err
			}

			if params.Get("always") == "true" {
				gt.AlwaysEnabled = true
			}
		}
		t, err := template.New(gt.Name).Parse(hostAndParams[0])
		if err != nil {
			return nil, err
		}
		gt.Host = t
		return gt, nil
	}
	return nil, errors.Errorf("invalid gateway template %s", t)
}

type IngressGatewaySet struct {
	gateways map[string]GatewayTemplate

	serviceName string
	namespace   string
}

func (s IngressGatewaySet) For(service string, namespace string) *IngressGatewaySet {
	s.serviceName = service
	s.namespace = namespace
	return &s
}

func (s *IngressGatewaySet) Endpoints() map[string]string {
	endpoints := map[string]string{
		"default": "http://" + s.serviceName,
	}

	for _, gt := range s.gateways {
		host := s.hostFor(&gt)

		if host == "" {
			endpoints[gt.Name] = ""
		} else {
			if gt.Https {
				endpoints[gt.Name] = "https://" + host
			} else {
				endpoints[gt.Name] = "http://" + host
			}
		}
	}

	return endpoints
}

func (s *IngressGatewaySet) hostFor(gt *GatewayTemplate) string {
	b := bytes.NewBuffer(nil)
	_ = gt.Host.Execute(b, map[string]string{
		"Name":      s.serviceName,
		"Namespace": s.namespace,
	})
	return b.String()
}

func (s *IngressGatewaySet) IngressRules(paths map[string]string, gateways ...string) (rules []networkingv1.IngressRule) {
	gatewaySet := make(map[string]GatewayTemplate, 0)
	for name, g := range s.gateways {
		if g.AlwaysEnabled {
			gatewaySet[name] = g
		}
	}

	fmt.Println("IngressRules", gateways)

	for i := range gateways {
		gateway := gateways[i]

		if gt, ok := s.gateways[gateway]; ok {
			gatewaySet[gt.Name] = gt
		}

		if strings.Contains(gateway, "+") {
			t, err := ParseGatewayTemplate(gateway)
			if err == nil {
				gatewaySet[t.Name] = *t
			}
		}
	}

	for _, gt := range gatewaySet {
		for portName, p := range paths {
			r := networkingv1.IngressRule{}
			r.Host = s.hostFor(&gt)
			r.HTTP = &networkingv1.HTTPIngressRuleValue{
				Paths: []networkingv1.HTTPIngressPath{
					{
						Path:     p,
						PathType: ptr.Ptr(networkingv1.PathTypeImplementationSpecific),
						Backend: networkingv1.IngressBackend{
							Service: &networkingv1.IngressServiceBackend{
								Name: s.serviceName,
								Port: networkingv1.ServiceBackendPort{
									Name: portName,
								},
							},
						},
					},
				},
			}
			rules = append(rules, r)
		}
	}

	return
}

type GatewayTemplate struct {
	Name          string
	Host          *template.Template
	Https         bool
	AlwaysEnabled bool
}
