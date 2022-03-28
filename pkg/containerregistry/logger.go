package containerregistry

import (
	"context"
	"fmt"

	dcontext "github.com/distribution/distribution/v3/context"
	"github.com/go-logr/logr"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

func init() {
	logrus.SetFormatter(&formatter{})
}

type formatter struct {
}

func (f formatter) Format(entry *logrus.Entry) ([]byte, error) {
	ctx := entry.Context
	if ctx == nil {
		ctx = context.Background()
	}

	l := logr.FromContextOrDiscard(ctx)

	keyValues := make([]any, 0, len(entry.Data)*2)

	for k := range entry.Data {
		if k != "" && k[0] == '_' {
			continue
		}
		if k == logrus.ErrorKey {
			continue
		}
		keyValues = append(keyValues, k, entry.Data[k])
	}

	switch entry.Level {
	case logrus.TraceLevel:
		l.V(10).Info(entry.Message, keyValues...)
	case logrus.DebugLevel:
		l.V(1).Info(entry.Message, keyValues...)
	case logrus.InfoLevel:
		l.Info(entry.Message, keyValues...)
	case logrus.WarnLevel:
		l.V(1).Info(entry.Message, keyValues...)
	default:
		if err, ok := entry.Data[logrus.ErrorKey]; ok {
			if e, ok := err.(error); ok {
				l.Error(e, entry.Message, keyValues...)
			} else {
				l.Error(fmt.Errorf("%s", e), entry.Message, keyValues...)
			}
		} else {
			l.Error(errors.New(entry.Message), entry.Message, keyValues...)
		}

	}

	return nil, nil
}

func WithLogger(ctx context.Context, l logr.Logger) context.Context {
	ctx = logr.NewContext(ctx, l)
	return dcontext.WithLogger(ctx, logrus.WithContext(ctx))
}
