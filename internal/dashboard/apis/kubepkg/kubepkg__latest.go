package kubepkg

import (
	"context"

	kubepkgrepository "github.com/octohelm/kubepkg/internal/dashboard/domain/kubepkg/repository"

	"github.com/octohelm/courier/pkg/courierhttp"
)

type LatestKubepkgs struct {
	courierhttp.MethodGet `path:"/latest-kubepkgs"`
	GroupNameChannels     []string `name:"names" in:"query"`
}

func (p *LatestKubepkgs) Output(ctx context.Context) (any, error) {
	kr := kubepkgrepository.NewKubepkgRepository()
	return kr.Latest(ctx, p.GroupNameChannels)
}
