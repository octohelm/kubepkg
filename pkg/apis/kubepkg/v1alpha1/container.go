package v1alpha1

import (
	"strings"

	"github.com/octohelm/kubepkg/pkg/cueutil"
	corev1 "k8s.io/api/core/v1"
)

type Image struct {
	Name       string            `json:"name"`
	Tag        string            `json:"tag,omitempty"`
	Digest     string            `json:"digest,omitempty"`
	Platforms  []string          `json:"platforms,omitempty"`
	PullPolicy corev1.PullPolicy `json:"pullPolicy,omitempty"`
}

func (v Image) FullName() string {
	s := strings.Builder{}
	s.WriteString(v.Name)
	if tag := v.Tag; tag != "" {
		s.WriteString(":")
		s.WriteString(tag)
	}
	if digest := v.Digest; digest != "" {
		s.WriteString("@")
		s.WriteString(digest)
	}
	return s.String()
}

type Container struct {
	Image Image `json:"image"`

	WorkingDir string                       `json:"workingDir,omitempty"`
	Command    []string                     `json:"command,omitempty"`
	Args       []string                     `json:"args,omitempty"`
	Env        map[string]EnvVarValueOrFrom `json:"env,omitempty"`

	// Ports: [PortName]: ContainerPort
	Ports map[string]int32 `json:"ports,omitempty"`

	Stdin     bool `json:"stdin,omitempty"`
	StdinOnce bool `json:"stdinOnce,omitempty"`
	TTY       bool `json:"tty,omitempty"`

	Resources      *corev1.ResourceRequirements `json:"resources,omitempty"`
	LivenessProbe  *corev1.Probe                `json:"livenessProbe,omitempty"`
	ReadinessProbe *corev1.Probe                `json:"readinessProbe,omitempty"`
	StartupProbe   *corev1.Probe                `json:"startupProbe,omitempty"`
	Lifecycle      *corev1.Lifecycle            `json:"lifecycle,omitempty"`

	SecurityContext          *corev1.SecurityContext         `json:"securityContext,omitempty"`
	TerminationMessagePath   string                          `json:"terminationMessagePath,omitempty"`
	TerminationMessagePolicy corev1.TerminationMessagePolicy `json:"terminationMessagePolicy,omitempty"`
}

type EnvVarValueOrFrom struct {
	Value     string
	ValueFrom *corev1.EnvVarSource
}

func (envVar EnvVarValueOrFrom) MarshalText() ([]byte, error) {
	if envVar.ValueFrom == nil {
		return []byte(envVar.Value), nil
	}
	data, err := cueutil.Encode(envVar.ValueFrom)
	if err != nil {
		return nil, err
	}

	if len(data) <= 2 {
		return []byte{}, nil
	}

	return append([]byte{'@'}, data[1:len(data)-1]...), nil
}

func (envVar *EnvVarValueOrFrom) UnmarshalText(text []byte) (err error) {
	if len(text) == 0 {
		return nil
	}

	if text[0] == '@' {
		envVar.ValueFrom = &corev1.EnvVarSource{}
		if err := cueutil.Unmarshal(text[1:], envVar.ValueFrom); err != nil {
			return err
		}
		return nil
	}

	envVar.Value = string(text)

	return nil
}
