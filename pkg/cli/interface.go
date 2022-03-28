package cli

import "context"

type Command interface {
	Naming() *Name
	Run(ctx context.Context, args []string) error
}
