package agent

import "net/http"

type responseWriter struct {
	http.ResponseWriter
	StatusCode int
}

func (rw *responseWriter) WriteHeader(statusCode int) {
	rw.StatusCode = statusCode
	rw.ResponseWriter.WriteHeader(statusCode)
}
