package v1alpha1

import (
	"bytes"
	"strings"

	"github.com/octohelm/x/ptr"

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

	buf := bytes.NewBufferString("@")

	if ref := envVar.ValueFrom.FieldRef; ref != nil {
		buf.WriteString("field/")
		buf.WriteString(ref.FieldPath)
	} else if ref := envVar.ValueFrom.ResourceFieldRef; ref != nil {
		buf.WriteString("resource/")
		buf.WriteString(ref.Resource)
	} else if ref := envVar.ValueFrom.ConfigMapKeyRef; ref != nil {
		buf.WriteString("configMap/")
		buf.WriteString(ref.Name)
		buf.WriteString("/")
		buf.WriteString(ref.Key)
		if ref.Optional != nil && *ref.Optional {
			buf.WriteString("?")
		}
	} else if ref := envVar.ValueFrom.SecretKeyRef; ref != nil {
		buf.WriteString("secret/")
		buf.WriteString(ref.Name)
		buf.WriteString("/")
		buf.WriteString(ref.Key)
		if ref.Optional != nil && *ref.Optional {
			buf.WriteString("?")
		}
	}

	return buf.Bytes(), nil
}

func (envVar *EnvVarValueOrFrom) UnmarshalText(text []byte) (err error) {
	if len(text) == 0 {
		return nil
	}

	if text[0] == '@' {
		if idx := bytes.LastIndex(text, []byte("/")); idx > -1 {
			src := string(text[1:idx])
			key := string(text[idx+1:])

			switch {
			case strings.HasPrefix(src, "field"):
				envVar.ValueFrom = &corev1.EnvVarSource{
					FieldRef: &corev1.ObjectFieldSelector{
						FieldPath: key,
					},
				}
			case strings.HasPrefix(src, "resource"):
				envVar.ValueFrom = &corev1.EnvVarSource{
					ResourceFieldRef: &corev1.ResourceFieldSelector{
						Resource: key,
					},
				}
				return nil
			case strings.HasPrefix(src, "configMap"):
				r := &corev1.ConfigMapKeySelector{}
				r.Name = src[len("configMap/"):]
				r.Key = strings.TrimRight(key, "?")
				if strings.HasSuffix(key, "?") {
					r.Optional = ptr.Ptr(true)
				}
				envVar.ValueFrom = &corev1.EnvVarSource{
					ConfigMapKeyRef: r,
				}
				return nil
			case strings.HasPrefix(src, "secret"):
				r := &corev1.SecretKeySelector{}
				r.Name = src[len("secret/"):]
				r.Key = strings.TrimRight(key, "?")
				if strings.HasSuffix(key, "?") {
					r.Optional = ptr.Ptr(true)
				}
				envVar.ValueFrom = &corev1.EnvVarSource{
					SecretKeyRef: r,
				}
				return nil
			}
		}
	}

	envVar.Value = string(text)

	return nil
}
