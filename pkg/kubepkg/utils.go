package kubepkg

import "io"

func ForkWriter(w io.Writer, forks ...io.Writer) io.Writer {
	return &forkWriter{main: w, forks: forks}
}

type forkWriter struct {
	main  io.Writer
	forks []io.Writer
}

func (w *forkWriter) Write(p []byte) (n int, err error) {
	for i := range w.forks {
		_, _ = w.forks[i].Write(p)
	}
	return w.main.Write(p)
}
