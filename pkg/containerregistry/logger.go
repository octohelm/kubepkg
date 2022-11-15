package containerregistry

import (
	"context"

	"github.com/go-courier/logr"
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

	l := logr.FromContext(ctx)

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

	l = l.WithValues(keyValues...)

	switch entry.Level {
	case logrus.DebugLevel, logrus.TraceLevel:
		l.Debug(entry.Message)
	case logrus.InfoLevel:
		l.Info(entry.Message)
	case logrus.WarnLevel:
		l.Warn(errors.New(entry.Message))
	default:
		if err, ok := entry.Data[logrus.ErrorKey]; ok {
			if e, ok := err.(error); ok {
				l.Error(e)
			} else {
				l.Error(errors.Wrap(e, entry.Message))
			}
		} else {
			l.Error(errors.New(entry.Message))
		}
	}

	return nil, nil
}
