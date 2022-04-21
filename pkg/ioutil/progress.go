package ioutil

import (
	"context"
	"fmt"
	"github.com/go-logr/logr"
	"github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1"
	"time"
)

func NewProgressWriter(ctx context.Context, label string, size int64) *ProgressWriter {
	return &ProgressWriter{
		l:     logr.FromContextOrDiscard(ctx),
		label: label,
		size:  size,
	}
}

type ProgressWriter struct {
	label   string
	size    int64
	written int64
	l       logr.Logger
	t       *time.Ticker
}

func (pw *ProgressWriter) Write(p []byte) (n int, err error) {
	n = len(p)
	pw.written += int64(n)
	return
}

func (pw *ProgressWriter) Start() {
	pw.t = time.NewTicker(time.Second)

	go func() {
		for range pw.t.C {
			pw.l.Info(fmt.Sprintf(
				"%s %s/%s",
				pw.label,
				v1alpha1.FileSize(pw.written),
				v1alpha1.FileSize(pw.size),
			))
		}
	}()
}

func (pw *ProgressWriter) Stop() {
	pw.t.Stop()
}
