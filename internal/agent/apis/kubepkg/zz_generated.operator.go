/*
Package kubepkg GENERATED BY gengo:operator 
DON'T EDIT THIS FILE
*/
package kubepkg

import (
	github_com_octohelm_courier_pkg_courier "github.com/octohelm/courier/pkg/courier"
	github_com_octohelm_courier_pkg_statuserror "github.com/octohelm/courier/pkg/statuserror"
	github_com_octohelm_kubepkg_pkg_apis_kubepkg_v1alpha1 "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
)

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&ApplyKubePkg{}))
}

func (*ApplyKubePkg) ResponseContent() any {
	return nil
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&DelKubePkg{}))
}

func (*DelKubePkg) ResponseContent() any {
	return nil
}

func (*DelKubePkg) ResponseErrors() []error {
	return []error{
		&(github_com_octohelm_courier_pkg_statuserror.StatusErr{
			Code: 500,
			Key:  "RequestK8sFailed",
			Msg:  "RequestK8sFailed",
			Desc: "\ngithub.com/octohelm/courier/devpkg/operatorgen.(*statusErrScanner).scanStatusErrIsExist\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/statuserr_scanner.go:165\ngithub.com/octohelm/courier/devpkg/operatorgen.(*statusErrScanner).StatusErrorsInFunc.func1\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/statuserr_scanner.go:88\ngo/ast.inspector.Visit\n\t/opt/homebrew/opt/go/libexec/src/go/ast/walk.go:386\ngo/ast.Walk\n\t/opt/homebrew/opt/go/libexec/src/go/ast/walk.go:51\ngo/ast.Inspect\n\t/opt/homebrew/opt/go/libexec/src/go/ast/walk.go:397\ngithub.com/octohelm/courier/devpkg/operatorgen.(*statusErrScanner).StatusErrorsInFunc\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/statuserr_scanner.go:78\ngithub.com/octohelm/courier/devpkg/operatorgen.(*operatorGen).generateErrorsReturn\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/gen.go:60\ngithub.com/octohelm/courier/devpkg/operatorgen.(*operatorGen).generateReturns\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/gen.go:54\ngithub.com/octohelm/courier/devpkg/operatorgen.(*operatorGen).GenerateType\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/gen.go:44\ngithub.com/octohelm/gengo/pkg/gengo.(*context).doGenerate\n\t/Users/morlay/pkg/mod/github.com/octohelm/gengo@v0.0.0-20230602052920-d1e8eaa72959/pkg/gengo/context.go:187\ngithub.com/octohelm/gengo/pkg/gengo.(*context).pkgExecute\n\t/Users/morlay/pkg/mod/github.com/octohelm/gengo@v0.0.0-20230602052920-d1e8eaa72959/pkg/gengo/context.go:125\ngithub.com/octohelm/gengo/pkg/gengo.(*context).Execute\n\t/Users/morlay/pkg/mod/github.com/octohelm/gengo@v0.0.0-20230602052920-d1e8eaa72959/pkg/gengo/context.go:72\ngithub.com/innoai-tech/infra/devpkg/gengo.(*Gengo).Run\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/devpkg/gengo/gengo.go:24\ngithub.com/innoai-tech/infra/pkg/configuration.run\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/configuration/lifecycle.go:73\ngithub.com/innoai-tech/infra/pkg/configuration.RunOrServe\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/configuration/lifecycle.go:33\ngithub.com/innoai-tech/infra/pkg/configuration.Singletons.RunOrServe\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/configuration/singleton.go:44\ngithub.com/innoai-tech/infra/pkg/cli.(*app).newFrom.func1\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/cli/app.go:126\ngithub.com/spf13/cobra.(*Command).execute\n\t/Users/morlay/pkg/mod/github.com/spf13/cobra@v1.7.0/command.go:940\ngithub.com/spf13/cobra.(*Command).ExecuteC\n\t/Users/morlay/pkg/mod/github.com/spf13/cobra@v1.7.0/command.go:1068\ngithub.com/spf13/cobra.(*Command).Execute\n\t/Users/morlay/pkg/mod/github.com/spf13/cobra@v1.7.0/command.go:992\ngithub.com/spf13/cobra.(*Command).ExecuteContext\n\t/Users/morlay/pkg/mod/github.com/spf13/cobra@v1.7.0/command.go:985\ngithub.com/innoai-tech/infra/pkg/cli.(*app).ExecuteContext\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/cli/app.go:46\ngithub.com/innoai-tech/infra/pkg/cli.Execute\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/cli/execute.go:26\nmain.main\n\t/Users/morlay/src/github.com/octohelm/kubepkg/tool/internal/cmd/tool/main.go:30\nruntime.main\n\t/opt/homebrew/opt/go/libexec/src/runtime/proc.go:250\nruntime.goexit\n\t/opt/homebrew/opt/go/libexec/src/runtime/asm_arm64.s:1172",
		}),
	}
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&GetKubePkg{}))
}

func (*GetKubePkg) ResponseContent() any {
	return new(github_com_octohelm_kubepkg_pkg_apis_kubepkg_v1alpha1.KubePkg)
}

func (*GetKubePkg) ResponseErrors() []error {
	return []error{
		&(github_com_octohelm_courier_pkg_statuserror.StatusErr{
			Code: 500,
			Key:  "RequestK8sFailed",
			Msg:  "RequestK8sFailed",
			Desc: "\ngithub.com/octohelm/courier/devpkg/operatorgen.(*statusErrScanner).scanStatusErrIsExist\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/statuserr_scanner.go:165\ngithub.com/octohelm/courier/devpkg/operatorgen.(*statusErrScanner).StatusErrorsInFunc.func1\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/statuserr_scanner.go:88\ngo/ast.inspector.Visit\n\t/opt/homebrew/opt/go/libexec/src/go/ast/walk.go:386\ngo/ast.Walk\n\t/opt/homebrew/opt/go/libexec/src/go/ast/walk.go:51\ngo/ast.Inspect\n\t/opt/homebrew/opt/go/libexec/src/go/ast/walk.go:397\ngithub.com/octohelm/courier/devpkg/operatorgen.(*statusErrScanner).StatusErrorsInFunc\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/statuserr_scanner.go:78\ngithub.com/octohelm/courier/devpkg/operatorgen.(*operatorGen).generateErrorsReturn\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/gen.go:60\ngithub.com/octohelm/courier/devpkg/operatorgen.(*operatorGen).generateReturns\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/gen.go:54\ngithub.com/octohelm/courier/devpkg/operatorgen.(*operatorGen).GenerateType\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/gen.go:44\ngithub.com/octohelm/gengo/pkg/gengo.(*context).doGenerate\n\t/Users/morlay/pkg/mod/github.com/octohelm/gengo@v0.0.0-20230602052920-d1e8eaa72959/pkg/gengo/context.go:187\ngithub.com/octohelm/gengo/pkg/gengo.(*context).pkgExecute\n\t/Users/morlay/pkg/mod/github.com/octohelm/gengo@v0.0.0-20230602052920-d1e8eaa72959/pkg/gengo/context.go:125\ngithub.com/octohelm/gengo/pkg/gengo.(*context).Execute\n\t/Users/morlay/pkg/mod/github.com/octohelm/gengo@v0.0.0-20230602052920-d1e8eaa72959/pkg/gengo/context.go:72\ngithub.com/innoai-tech/infra/devpkg/gengo.(*Gengo).Run\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/devpkg/gengo/gengo.go:24\ngithub.com/innoai-tech/infra/pkg/configuration.run\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/configuration/lifecycle.go:73\ngithub.com/innoai-tech/infra/pkg/configuration.RunOrServe\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/configuration/lifecycle.go:33\ngithub.com/innoai-tech/infra/pkg/configuration.Singletons.RunOrServe\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/configuration/singleton.go:44\ngithub.com/innoai-tech/infra/pkg/cli.(*app).newFrom.func1\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/cli/app.go:126\ngithub.com/spf13/cobra.(*Command).execute\n\t/Users/morlay/pkg/mod/github.com/spf13/cobra@v1.7.0/command.go:940\ngithub.com/spf13/cobra.(*Command).ExecuteC\n\t/Users/morlay/pkg/mod/github.com/spf13/cobra@v1.7.0/command.go:1068\ngithub.com/spf13/cobra.(*Command).Execute\n\t/Users/morlay/pkg/mod/github.com/spf13/cobra@v1.7.0/command.go:992\ngithub.com/spf13/cobra.(*Command).ExecuteContext\n\t/Users/morlay/pkg/mod/github.com/spf13/cobra@v1.7.0/command.go:985\ngithub.com/innoai-tech/infra/pkg/cli.(*app).ExecuteContext\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/cli/app.go:46\ngithub.com/innoai-tech/infra/pkg/cli.Execute\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/cli/execute.go:26\nmain.main\n\t/Users/morlay/src/github.com/octohelm/kubepkg/tool/internal/cmd/tool/main.go:30\nruntime.main\n\t/opt/homebrew/opt/go/libexec/src/runtime/proc.go:250\nruntime.goexit\n\t/opt/homebrew/opt/go/libexec/src/runtime/asm_arm64.s:1172",
		}),
	}
}

func init() {
	R.Register(github_com_octohelm_courier_pkg_courier.NewRouter(&ListKubePkg{}))
}

func (*ListKubePkg) ResponseContent() any {
	return new([]github_com_octohelm_kubepkg_pkg_apis_kubepkg_v1alpha1.KubePkg)
}

func (*ListKubePkg) ResponseErrors() []error {
	return []error{
		&(github_com_octohelm_courier_pkg_statuserror.StatusErr{
			Code: 500,
			Key:  "RequestK8sFailed",
			Msg:  "RequestK8sFailed",
			Desc: "\ngithub.com/octohelm/courier/devpkg/operatorgen.(*statusErrScanner).scanStatusErrIsExist\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/statuserr_scanner.go:165\ngithub.com/octohelm/courier/devpkg/operatorgen.(*statusErrScanner).StatusErrorsInFunc.func1\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/statuserr_scanner.go:88\ngo/ast.inspector.Visit\n\t/opt/homebrew/opt/go/libexec/src/go/ast/walk.go:386\ngo/ast.Walk\n\t/opt/homebrew/opt/go/libexec/src/go/ast/walk.go:51\ngo/ast.Inspect\n\t/opt/homebrew/opt/go/libexec/src/go/ast/walk.go:397\ngithub.com/octohelm/courier/devpkg/operatorgen.(*statusErrScanner).StatusErrorsInFunc\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/statuserr_scanner.go:78\ngithub.com/octohelm/courier/devpkg/operatorgen.(*operatorGen).generateErrorsReturn\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/gen.go:60\ngithub.com/octohelm/courier/devpkg/operatorgen.(*operatorGen).generateReturns\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/gen.go:54\ngithub.com/octohelm/courier/devpkg/operatorgen.(*operatorGen).GenerateType\n\t/Users/morlay/pkg/mod/github.com/octohelm/courier@v0.0.0-20230712081751-39cdf10112d1/devpkg/operatorgen/gen.go:44\ngithub.com/octohelm/gengo/pkg/gengo.(*context).doGenerate\n\t/Users/morlay/pkg/mod/github.com/octohelm/gengo@v0.0.0-20230602052920-d1e8eaa72959/pkg/gengo/context.go:187\ngithub.com/octohelm/gengo/pkg/gengo.(*context).pkgExecute\n\t/Users/morlay/pkg/mod/github.com/octohelm/gengo@v0.0.0-20230602052920-d1e8eaa72959/pkg/gengo/context.go:125\ngithub.com/octohelm/gengo/pkg/gengo.(*context).Execute\n\t/Users/morlay/pkg/mod/github.com/octohelm/gengo@v0.0.0-20230602052920-d1e8eaa72959/pkg/gengo/context.go:72\ngithub.com/innoai-tech/infra/devpkg/gengo.(*Gengo).Run\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/devpkg/gengo/gengo.go:24\ngithub.com/innoai-tech/infra/pkg/configuration.run\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/configuration/lifecycle.go:73\ngithub.com/innoai-tech/infra/pkg/configuration.RunOrServe\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/configuration/lifecycle.go:33\ngithub.com/innoai-tech/infra/pkg/configuration.Singletons.RunOrServe\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/configuration/singleton.go:44\ngithub.com/innoai-tech/infra/pkg/cli.(*app).newFrom.func1\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/cli/app.go:126\ngithub.com/spf13/cobra.(*Command).execute\n\t/Users/morlay/pkg/mod/github.com/spf13/cobra@v1.7.0/command.go:940\ngithub.com/spf13/cobra.(*Command).ExecuteC\n\t/Users/morlay/pkg/mod/github.com/spf13/cobra@v1.7.0/command.go:1068\ngithub.com/spf13/cobra.(*Command).Execute\n\t/Users/morlay/pkg/mod/github.com/spf13/cobra@v1.7.0/command.go:992\ngithub.com/spf13/cobra.(*Command).ExecuteContext\n\t/Users/morlay/pkg/mod/github.com/spf13/cobra@v1.7.0/command.go:985\ngithub.com/innoai-tech/infra/pkg/cli.(*app).ExecuteContext\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/cli/app.go:46\ngithub.com/innoai-tech/infra/pkg/cli.Execute\n\t/Users/morlay/pkg/mod/github.com/innoai-tech/infra@v0.0.0-20230713022803-fadf0093462a/pkg/cli/execute.go:26\nmain.main\n\t/Users/morlay/src/github.com/octohelm/kubepkg/tool/internal/cmd/tool/main.go:30\nruntime.main\n\t/opt/homebrew/opt/go/libexec/src/runtime/proc.go:250\nruntime.goexit\n\t/opt/homebrew/opt/go/libexec/src/runtime/asm_arm64.s:1172",
		}),
	}
}
