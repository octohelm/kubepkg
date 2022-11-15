package logutil

import (
	"context"

	"github.com/go-courier/logr"
	gologr "github.com/go-logr/logr"
	"github.com/pkg/errors"
)

func GoLogrFromContext(ctx context.Context) gologr.Logger {
	l := logr.FromContext(ctx)
	return gologr.New(&logSink{l: l})
}

type logSink struct {
	l             logr.Logger
	keysAndValues []any
}

func (l *logSink) Init(info gologr.RuntimeInfo) {
}

func (l *logSink) Enabled(level int) bool {
	return true
}

func (l *logSink) Info(level int, msg string, keysAndValues ...interface{}) {
	log := l.l.WithValues(l.keysAndValues...).WithValues(keysAndValues...)

	//if l.name == "" {
	//}

	if level > 0 {
		log.Debug(msg)
	} else {
		log.Info(msg)
	}
}

func (l *logSink) Error(err error, msg string, keysAndValues ...interface{}) {
	l.l.WithValues(l.keysAndValues...).WithValues(keysAndValues...).Error(errors.Wrap(err, msg))
}

func (l *logSink) WithValues(keysAndValues ...interface{}) gologr.LogSink {
	return &logSink{
		l:             l.l,
		keysAndValues: append(l.keysAndValues, keysAndValues...),
	}
}

func (l *logSink) WithName(name string) gologr.LogSink {
	return &logSink{
		l:             l.l,
		keysAndValues: append(l.keysAndValues, "@name", name),
	}
}
