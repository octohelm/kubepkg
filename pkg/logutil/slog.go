package logutil

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log/slog"
	"strings"
	"sync"
	"sync/atomic"

	"github.com/go-courier/logr"
	"github.com/mattn/go-colorable"
)

type logger struct {
	spans []string
	slogr *slog.Logger
}

func (d *logger) WithValues(keyAndValues ...any) logr.Logger {
	return &logger{
		spans: d.spans,
		slogr: d.slogr.With(keyAndValues...),
	}
}

func (d *logger) Start(ctx context.Context, name string, keyAndValues ...any) (context.Context, logr.Logger) {
	spans := append(d.spans, name)

	return ctx, &logger{
		spans: spans,
		slogr: d.slogr.WithGroup(strings.Join(spans, "/")).With(keyAndValues...),
	}
}

func (d *logger) End() {
	if len(d.spans) != 0 {
		d.spans = d.spans[0 : len(d.spans)-1]
	}
}

func (d *logger) Debug(format string, args ...any) {
	d.slogr.Debug(fmt.Sprintf(format, args...))
}

func (d *logger) Info(format string, args ...any) {
	d.slogr.Info(fmt.Sprintf(format, args...))
}

func (d *logger) Warn(err error) {
	d.slogr.Warn("", err)
}

func (d *logger) Error(err error) {
	d.slogr.Error("", err)
}

func fromLogrLevel(l logr.Level) slog.Level {
	switch l {
	case logr.ErrorLevel:
		return slog.LevelError
	case logr.WarnLevel:
		return slog.LevelWarn
	case logr.InfoLevel:
		return slog.LevelInfo
	case logr.DebugLevel:
		return slog.LevelDebug
	}
	return slog.LevelDebug
}

type slogHandler struct {
	lvl   slog.Level
	group string
	attrs []slog.Attr
}

func (s *slogHandler) Enabled(ctx context.Context, level slog.Level) bool {
	return level >= s.lvl
}

type Printer interface {
	Fprintf(w io.Writer, format string, a ...any) (n int, err error)
}

func withLevelColor(level slog.Level) func(io.Writer) io.Writer {
	switch level {
	case slog.LevelError:
		return WithColor(FgRed)
	case slog.LevelWarn:
		return WithColor(FgYellow)
	case slog.LevelInfo:
		return WithColor(FgGreen)
	}
	return WithColor(FgWhite)
}

func (s *slogHandler) Handle(ctx context.Context, r slog.Record) error {
	buf := bytes.NewBuffer(nil)

	_, _ = fmt.Fprintf(WithColor(FgWhite)(buf), "%s", r.Time.Format("15:04:05.000"))
	_, _ = fmt.Fprintf(withLevelColor(r.Level)(buf), " %s", strings.ToUpper(r.Level.String())[0:4])

	if s.group != "" {
		_, _ = fmt.Fprintf(withNameColor(s.group)(buf), " %s", s.group)
	}

	_, _ = fmt.Fprintf(buf, " %s", r.Message)

	for _, attr := range s.attrs {
		_, _ = fmt.Fprintf(WithColor(FgWhite)(buf), " %s=%q", attr.Key, attr.Value)
	}

	_, _ = fmt.Fprint(buf, "\n")

	r.Attrs(func(attr slog.Attr) bool {
		if attr.Key == "err" {
			if err := attr.Value.Any().(error); err != nil {
				_, _ = fmt.Fprintf(buf, "%+v", err)
			}
		}
		return true
	})

	_, _ = io.Copy(colorable.NewColorableStdout(), buf)

	return nil
}

func (s slogHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	return &slogHandler{
		lvl:   s.lvl,
		group: s.group,
		attrs: append(s.attrs, attrs...),
	}
}

func (s slogHandler) WithGroup(group string) slog.Handler {
	return &slogHandler{
		lvl:   s.lvl,
		attrs: s.attrs,
		group: group,
	}
}

var colorIndexes = sync.Map{}
var colorIdx uint32 = 0
var colorFns = []WrapWriter{
	WithColor(FgBlue),
	WithColor(FgMagenta),
	WithColor(FgCyan),
	WithColor(FgYellow),
}

func withNameColor(name string) WrapWriter {
	idx, ok := colorIndexes.Load(name)
	if !ok {
		i := atomic.LoadUint32(&colorIdx)
		colorIndexes.Store(name, i)
		atomic.AddUint32(&colorIdx, 1)
		idx = i
	}
	return colorFns[int(idx.(uint32))%len(colorFns)]
}
