package agent

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func writeStatusErr(rw http.ResponseWriter, stateCode int, err error) {
	rw.WriteHeader(stateCode)
	_ = json.NewEncoder(rw).Encode(&StatusErr{
		Code:    http.StatusText(stateCode),
		Message: err.Error(),
	})

}

type StatusErr struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (s StatusErr) Error() string {
	return fmt.Sprintf("[%s] %s", s.Code, s.Message)
}
