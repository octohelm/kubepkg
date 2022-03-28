package cli

import (
	"context"
	"fmt"
	"os"
	"reflect"
	"strconv"
	"strings"

	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
)

func NewApp(name string, version string) *App {
	return &App{
		Name:    Name{Name: name},
		Version: version,
	}
}

type App struct {
	Name
	Version string
}

func (a *App) Run(ctx context.Context, args []string) error {
	app := a.newCmdFrom(a)

	return app.ExecuteContext(ctx)
}

func (a *App) newCmdFrom(cc Command) *cobra.Command {
	name := cc.Naming()

	c := &cobra.Command{
		Version: a.Version,
	}

	a.bindCommand(c, cc)

	c.Args = func(cmd *cobra.Command, args []string) error {
		return name.ValidArgs.Validate(args)
	}

	c.RunE = func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()

		if preRun, ok := cc.(interface {
			PreRun(ctx context.Context) context.Context
		}); ok {
			ctx = preRun.PreRun(ctx)
		}

		return cc.Run(ctx, args)
	}

	for i := range name.subcommands {
		c.AddCommand(a.newCmdFrom(name.subcommands[i]))
	}

	return c
}

func (a *App) bindCommand(c *cobra.Command, v Command) {
	rv := reflect.ValueOf(v)

	if rv.Kind() != reflect.Ptr || rv.Elem().Kind() != reflect.Struct {
		panic(fmt.Errorf("only support a ptr struct value, but got %#v", v))
	}

	rv = rv.Elem()

	naming := v.Naming()

	if naming.Name == "" {
		naming.Name = strings.ToLower(rv.Type().Name())
	}

	a.bindFromReflectValue(c, rv)

	c.Use = fmt.Sprintf("%s [flags] %s", naming.Name, strings.Join(naming.ValidArgs, " "))
	c.Short = naming.Desc
}

func (a *App) bindFromReflectValue(c *cobra.Command, rv reflect.Value) {
	t := rv.Type()

	for i := 0; i < t.NumField(); i++ {
		ft := t.Field(i)
		fv := rv.Field(i)

		if ft.Anonymous && ft.Type.Kind() == reflect.Struct {
			if n, ok := fv.Addr().Interface().(*Name); ok {
				n.Desc = ft.Tag.Get("desc")
				if v, ok := ft.Tag.Lookup("args"); ok {
					n.ValidArgs = ParseValidArgs(v)
				}
				continue
			}
			a.bindFromReflectValue(c, fv)
			continue
		}

		if n, ok := ft.Tag.Lookup("flag"); ok {
			parts := strings.SplitN(n, ",", 2)

			name, alias := parts[0], strings.Join(parts[1:], "")

			var envVars []string
			if tagEnv, ok := ft.Tag.Lookup("env"); ok {
				envVars = strings.Split(tagEnv, ",")
			}

			defaultText, defaultExists := ft.Tag.Lookup("default")

			ff := &flagVar{
				Name:        name,
				Alias:       alias,
				EnvVars:     envVars,
				Default:     defaultText,
				Required:    !defaultExists,
				Desc:        ft.Tag.Get("desc"),
				Destination: fv.Addr().Interface(),
			}

			if err := ff.Apply(c.Flags()); err != nil {
				panic(err)
			}
		}
	}
}

type flagVar struct {
	Name        string
	Desc        string
	Default     string
	Required    bool
	Alias       string
	EnvVars     []string
	Destination any
}

func (f *flagVar) DefaultValue() string {
	v := f.Default
	for i := range f.EnvVars {
		if found, ok := os.LookupEnv(f.EnvVars[i]); ok {
			v = found
			break
		}
	}
	return v
}

func (f *flagVar) Usage() string {
	if len(f.EnvVars) > 0 {
		s := strings.Builder{}
		s.WriteString(f.Desc)
		s.WriteString(" [")

		for i, envVar := range f.EnvVars {
			if i > 0 {
				s.WriteString(",")
			}
			s.WriteString("$")
			s.WriteString(envVar)
		}

		s.WriteString("]")
		return s.String()
	}
	return f.Desc
}

func (f *flagVar) Apply(flags *pflag.FlagSet) error {
	switch d := f.Destination.(type) {
	case *[]string:
		var v []string
		if sv := f.DefaultValue(); sv != "" {
			v = strings.Split(sv, ",")
		}
		flags.StringSliceVarP(d, f.Name, f.Alias, v, f.Usage())
	case *string:
		v := f.DefaultValue()
		flags.StringVarP(d, f.Name, f.Alias, v, f.Usage())
	case *int:
		var v int
		if sv := f.DefaultValue(); sv != "" {
			v, _ = strconv.Atoi(sv)
		}
		flags.IntVarP(d, f.Name, f.Alias, v, f.Usage())
	case *bool:
		var v bool
		if sv := f.DefaultValue(); sv != "" {
			v, _ = strconv.ParseBool(sv)
		}
		flags.BoolVarP(d, f.Name, f.Alias, v, f.Usage())
	}
	return nil
}
