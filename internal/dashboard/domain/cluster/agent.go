package cluster

import (
	database_sql_driver "database/sql/driver"

	"github.com/octohelm/storage/pkg/datatypes"
)

type AgentInfo struct {
	Endpoint string            `json:"endpoint,omitempty"`
	Labels   map[string]string `json:"labels,omitempty"`
}

func (AgentInfo) DataType(driverName string) string {
	return "text"
}

func (a *AgentInfo) Scan(src any) error {
	return datatypes.JSONScan(src, a)
}

func (a AgentInfo) Value() (database_sql_driver.Value, error) {
	return datatypes.JSONValue(a)
}

type AgentSecureInfo struct {
	OtpKeyURL string `json:"otpKeyURL,omitempty"`
}

func (AgentSecureInfo) DataType(driverName string) string {
	return "text"
}

func (a *AgentSecureInfo) Scan(src any) error {
	return datatypes.JSONScan(src, a)
}

func (a AgentSecureInfo) Value() (database_sql_driver.Value, error) {
	return datatypes.JSONValue(a)
}
