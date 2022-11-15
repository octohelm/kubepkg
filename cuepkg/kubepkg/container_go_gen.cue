// DO NOT EDIT THIS FILE DIRECTLY.
// generated by go extractor.
package v1alpha1

import pkg_k8s_io_api_core_v1 "k8s.io/api/core/v1"

#Image: {
	name:    string
	tag?:    string
	digest?: string
	platforms?: [...string]
	pullPolicy?: pkg_k8s_io_api_core_v1.#PullPolicy
}

#Container: {
	image:       #Image
	workingDir?: string
	command?: [...string]
	args?: [...string]
	env?: [string]: #EnvVarValueOrFrom
	// Ports: [PortName]: ContainerPort
	ports?: {[string]: int32}
	stdin?:                    bool
	stdinOnce?:                bool
	tty?:                      bool
	resources?:                pkg_k8s_io_api_core_v1.#ResourceRequirements
	livenessProbe?:            pkg_k8s_io_api_core_v1.#Probe
	readinessProbe?:           pkg_k8s_io_api_core_v1.#Probe
	startupProbe?:             pkg_k8s_io_api_core_v1.#Probe
	lifecycle?:                pkg_k8s_io_api_core_v1.#Lifecycle
	securityContext?:          pkg_k8s_io_api_core_v1.#SecurityContext
	terminationMessagePath?:   string
	terminationMessagePolicy?: pkg_k8s_io_api_core_v1.#TerminationMessagePolicy
}

#EnvVarValueOrFrom: string