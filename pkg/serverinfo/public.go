package serverinfo

import (
	"context"
	"fmt"
	"net/url"
	"strings"
	"sync"

	"github.com/octohelm/courier/pkg/courier"
	"github.com/octohelm/courier/pkg/courierhttp/handler/httprouter"
)

type EndpointProvider interface {
	EndpointFor(role string) (url.URL, bool)
}

type EndpointRoleDescriber interface {
	EndpointRole() string
}

type Public struct {
	// Serve Public Endpoint
	Endpoint string `opt:",omitempty"`

	endpoints sync.Map
}

func (p *Public) EndpointFor(name string) (url.URL, bool) {
	v, ok := p.endpoints.Load(name)
	if ok {
		return v.(url.URL), true
	}
	return url.URL{}, false
}

func (p *Public) Register(name string, route string) error {
	u, err := url.Parse(p.Endpoint + route)
	if err != nil {
		return err
	}
	p.endpoints.Store(name, *u)
	return nil
}

func (v *Public) InitWithAddr(addr string) error {
	if v.Endpoint == "" {
		if strings.HasPrefix(addr, ":") {
			addr = fmt.Sprintf("localhost%s", addr)
		}
		v.Endpoint = fmt.Sprintf("http://%s", addr)
	}

	if v.Endpoint != "" {
		return v.Register("root", "")
	}
	return nil
}

func (p *Public) ApplyRouter(r courier.Router) error {
	for _, r := range r.Routes() {
		rh, err := httprouter.NewRouteHandler(r, "")
		if err != nil {
			return err
		}

		operators := rh.Operators()
		lastOperator := operators[len(operators)-1]

		if e, ok := lastOperator.Operator.(EndpointRoleDescriber); ok {
			if err := p.Register(e.EndpointRole(), rh.Path()); err != nil {
				return err
			}
		}
	}
	return nil
}

type endpointProviderContext struct{}

func EndpointProviderFromContext(ctx context.Context) EndpointProvider {
	if x, ok := ctx.Value(endpointProviderContext{}).(EndpointProvider); ok {
		return x
	}
	return &Public{}
}

func EndpointProviderWithContext(ctx context.Context, p EndpointProvider) context.Context {
	return context.WithValue(ctx, endpointProviderContext{}, p)
}
