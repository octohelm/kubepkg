package kubepkg

#Affinity: {
	nodeAffinity?:    #NodeAffinity
	podAffinity?:     #PodAffinity
	podAntiAffinity?: #PodAntiAffinity
}

#Capabilities: {
	add?: [...#Capability]
	drop?: [...#Capability]
}

#Capability: string

#ClaimSource: {
	resourceClaimName?:         string
	resourceClaimTemplateName?: string
}

#CompletionMode: string

#ConcurrencyPolicy: string

#ConditionStatus: string

#ConfigMapVolumeSource: {
	#LocalObjectReference
	{
		defaultMode?: int32
		items?: [...#KeyToPath]
		optional?: bool
	}
}

#Container: {
	args?: [...string]
	command?: [...string]
	env?: [X=string]: #EnvVarValueOrFrom
	image:          #Image
	lifecycle?:     #Lifecycle
	livenessProbe?: #Probe
	ports?: [X=string]: int32
	readinessProbe?:           #Probe
	resources?:                #ResourceRequirements
	securityContext?:          #SecurityContext
	startupProbe?:             #Probe
	stdin?:                    bool
	stdinOnce?:                bool
	terminationMessagePath?:   string
	terminationMessagePolicy?: #TerminationMessagePolicy
	tty?:                      bool
	workingDir?:               string
}

#CronJobSpec: {
	concurrencyPolicy?:          #ConcurrencyPolicy
	failedJobsHistoryLimit?:     int32
	jobTemplate:                 #JobTemplateSpec
	schedule:                    string
	startingDeadlineSeconds?:    int64
	successfulJobsHistoryLimit?: int32
	suspend?:                    bool
	timeZone?:                   string
}

#DNSPolicy: string

#DaemonSetSpec: {
	minReadySeconds?:      int32
	revisionHistoryLimit?: int32
	selector:              #LabelSelector
	template:              #PodTemplateSpec
	updateStrategy?:       #DaemonSetUpdateStrategy
}

#DaemonSetUpdateStrategy: {
	rollingUpdate?: #RollingUpdateDaemonSet
	type?:          #DaemonSetUpdateStrategyType
}

#DaemonSetUpdateStrategyType: "RollingUpdate" | "OnDelete"

#Deploy: {
	annotations?: [X=string]: string
	kind:  "StatefulSet"
	spec?: #StatefulSetSpec
} | {
	annotations?: [X=string]: string
	kind:  "Job"
	spec?: #JobSpec
} | {
	annotations?: [X=string]: string
	kind:  "CronJob"
	spec?: #CronJobSpec
} | {
	annotations?: [X=string]: string
	kind: "Secret"
} | {
	annotations?: [X=string]: string
	kind: "ConfigMap"
} | {
	annotations?: [X=string]: string
	kind:  "Deployment"
	spec?: #DeploymentSpec
} | {
	annotations?: [X=string]: string
	kind:  "DaemonSet"
	spec?: #DaemonSetSpec
}

#DeploymentSpec: {
	minReadySeconds?:         int32
	paused?:                  bool
	progressDeadlineSeconds?: int32
	replicas?:                int32
	revisionHistoryLimit?:    int32
	selector:                 #LabelSelector
	strategy?:                #DeploymentStrategy
	template:                 #PodTemplateSpec
}

#DeploymentStrategy: {
	rollingUpdate?: #RollingUpdateDeployment
	type?:          #DeploymentStrategyType
}

#DeploymentStrategyType: "Recreate" | "RollingUpdate"

#DigestMeta: {
	digest:    string
	name:      string
	platform?: string
	size:      #FileSize
	tag?:      string
	type:      #DigestMetaType
}

#DigestMetaType: "blob" | "manifest"

#EnvVarValueOrFrom: string

#ExecAction: command?: [...string]

#Expose: {
	gateway?: [...string]
	type: string
}

#FileSize: int64

#GRPCAction: {
	port:    int32
	service: string
}

#HTTPGetAction: {
	host?: string
	httpHeaders?: [...#HTTPHeader]
	path?:   string
	port:    #IntOrString
	scheme?: #URIScheme
}

#HTTPHeader: {
	name:  string
	value: string
}

#HostAlias: {
	hostnames?: [...string]
	ip?: string
}

#Image: {
	digest?: string
	name:    string
	platforms?: [...string]
	pullPolicy?: #PullPolicy
	tag?:        string
}

#IntOrString: int32 | string

#JobSpec: {
	activeDeadlineSeconds?:   int64
	backoffLimit?:            int32
	completionMode?:          #CompletionMode
	completions?:             int32
	manualSelector?:          bool
	parallelism?:             int32
	podFailurePolicy?:        #PodFailurePolicy
	selector?:                #LabelSelector
	suspend?:                 bool
	template:                 #PodTemplateSpec
	ttlSecondsAfterFinished?: int32
}

#JobTemplateSpec: {
	metadata?: #ObjectMeta
	spec?:     #JobSpec
}

#KeyToPath: {
	key:   string
	mode?: int32
	path:  string
}

#KubePkg: {
	#TypeMeta
	{
		metadata?: #ObjectMeta
		spec:      #Spec
		status?:   #Status
	}
}

#LabelSelector: {
	matchExpressions?: [...#LabelSelectorRequirement]
	matchLabels?: [X=string]: string
}

#LabelSelectorOperator: string

#LabelSelectorRequirement: {
	key:      string
	operator: #LabelSelectorOperator
	values?: [...string]
}

#Lifecycle: {
	postStart?: #LifecycleHandler
	preStop?:   #LifecycleHandler
}

#LifecycleHandler: {
	exec?:      #ExecAction
	httpGet?:   #HTTPGetAction
	tcpSocket?: #TCPSocketAction
}

#LocalObjectReference: name?: string

#Manifests: [X=string]: _

#NodeAffinity: {
	preferredDuringSchedulingIgnoredDuringExecution?: [...#PreferredSchedulingTerm]
	requiredDuringSchedulingIgnoredDuringExecution?: #NodeSelector
}

#NodeInclusionPolicy: string

#NodeSelector: nodeSelectorTerms: [...#NodeSelectorTerm]

#NodeSelectorOperator: string

#NodeSelectorRequirement: {
	key:      string
	operator: #NodeSelectorOperator
	values?: [...string]
}

#NodeSelectorTerm: {
	matchExpressions?: [...#NodeSelectorRequirement]
	matchFields?: [...#NodeSelectorRequirement]
}

#OSName: string

#ObjectMeta: {
	annotations?: [X=string]: string
	labels?: [X=string]: string
	name?:      string
	namespace?: string
}

#PersistentVolumeAccessMode: string

#PersistentVolumeClaim: {
	#TypeMeta
	{
		metadata?: #ObjectMeta
		spec?:     #PersistentVolumeClaimSpec
		status?:   #PersistentVolumeClaimStatus
	}
}

#PersistentVolumeClaimCondition: {
	lastProbeTime?:      #Time
	lastTransitionTime?: #Time
	message?:            string
	reason?:             string
	status:              #ConditionStatus
	type:                #PersistentVolumeClaimConditionType
}

#PersistentVolumeClaimConditionType: string

#PersistentVolumeClaimPhase: string

#PersistentVolumeClaimResizeStatus: string

#PersistentVolumeClaimRetentionPolicyType: string

#PersistentVolumeClaimSpec: {
	accessModes?: [...#PersistentVolumeAccessMode]
	dataSource?:       #TypedLocalObjectReference
	dataSourceRef?:    #TypedObjectReference
	resources?:        #ResourceRequirements
	selector?:         #LabelSelector
	storageClassName?: string
	volumeMode?:       #PersistentVolumeMode
	volumeName?:       string
}

#PersistentVolumeClaimStatus: {
	accessModes?: [...#PersistentVolumeAccessMode]
	allocatedResources?: #ResourceList
	capacity?:           #ResourceList
	conditions?: [...#PersistentVolumeClaimCondition]
	phase?:        #PersistentVolumeClaimPhase
	resizeStatus?: #PersistentVolumeClaimResizeStatus
}

#PersistentVolumeClaimVolumeSource: {
	claimName: string
	readOnly?: bool
}

#PersistentVolumeMode: string

#PodAffinity: {
	preferredDuringSchedulingIgnoredDuringExecution?: [...#WeightedPodAffinityTerm]
	requiredDuringSchedulingIgnoredDuringExecution?: [...#PodAffinityTerm]
}

#PodAffinityTerm: {
	labelSelector?:     #LabelSelector
	namespaceSelector?: #LabelSelector
	namespaces?: [...string]
	topologyKey: string
}

#PodAntiAffinity: {
	preferredDuringSchedulingIgnoredDuringExecution?: [...#WeightedPodAffinityTerm]
	requiredDuringSchedulingIgnoredDuringExecution?: [...#PodAffinityTerm]
}

#PodConditionType: string

#PodDNSConfig: {
	nameservers?: [...string]
	options?: [...#PodDNSConfigOption]
	searches?: [...string]
}

#PodDNSConfigOption: {
	name?:  string
	value?: string
}

#PodFSGroupChangePolicy: string

#PodFailurePolicy: rules: [...#PodFailurePolicyRule]

#PodFailurePolicyAction: string

#PodFailurePolicyOnExitCodesOperator: string

#PodFailurePolicyOnExitCodesRequirement: {
	containerName: string
	operator:      #PodFailurePolicyOnExitCodesOperator
	values: [...int32]
}

#PodFailurePolicyOnPodConditionsPattern: {
	status: #ConditionStatus
	type:   #PodConditionType
}

#PodFailurePolicyRule: {
	action:      #PodFailurePolicyAction
	onExitCodes: #PodFailurePolicyOnExitCodesRequirement
	onPodConditions: [...#PodFailurePolicyOnPodConditionsPattern]
}

#PodManagementPolicyType: string

#PodOS: name: #OSName

#PodReadinessGate: conditionType: #PodConditionType

#PodResourceClaim: {
	name:    string
	source?: #ClaimSource
}

#PodSchedulingGate: name: string

#PodSecurityContext: {
	fsGroup?:             int64
	fsGroupChangePolicy?: #PodFSGroupChangePolicy
	runAsGroup?:          int64
	runAsNonRoot?:        bool
	runAsUser?:           int64
	seLinuxOptions?:      #SELinuxOptions
	seccompProfile?:      #SeccompProfile
	supplementalGroups?: [...int64]
	sysctls?: [...#Sysctl]
	windowsOptions?: #WindowsSecurityContextOptions
}

#PodSpec: {
	activeDeadlineSeconds?:        int64
	affinity?:                     #Affinity
	automountServiceAccountToken?: bool
	dnsConfig?:                    #PodDNSConfig
	dnsPolicy?:                    #DNSPolicy
	enableServiceLinks?:           bool
	hostAliases?: [...#HostAlias]
	hostIPC?:     bool
	hostNetwork?: bool
	hostPID?:     bool
	hostUsers?:   bool
	hostname?:    string
	imagePullSecrets?: [...#LocalObjectReference]
	nodeName?: string
	nodeSelector?: [X=string]: string
	os?:                #PodOS
	overhead?:          #ResourceList
	preemptionPolicy?:  #PreemptionPolicy
	priority?:          int32
	priorityClassName?: string
	readinessGates?: [...#PodReadinessGate]
	resourceClaims?: [...#PodResourceClaim]
	restartPolicy?:    #RestartPolicy
	runtimeClassName?: string
	schedulerName?:    string
	schedulingGates?: [...#PodSchedulingGate]
	securityContext?:               #PodSecurityContext
	serviceAccount?:                string
	serviceAccountName?:            string
	setHostnameAsFQDN?:             bool
	shareProcessNamespace?:         bool
	subdomain?:                     string
	terminationGracePeriodSeconds?: int64
	tolerations?: [...#Toleration]
	topologySpreadConstraints?: [...#TopologySpreadConstraint]
}

#PodTemplateSpec: {
	metadata?: #ObjectMeta
	spec?:     #PodSpec
}

#PolicyRule: {
	apiGroups?: [...string]
	nonResourceURLs?: [...string]
	resourceNames?: [...string]
	resources?: [...string]
	verbs: [...string]
}

#PreemptionPolicy: "Never" | "PreemptLowerPriority"

#PreferredSchedulingTerm: {
	preference: #NodeSelectorTerm
	weight:     int32
}

#Probe: {
	#ProbeHandler
	{
		failureThreshold?:              int32
		initialDelaySeconds?:           int32
		periodSeconds?:                 int32
		successThreshold?:              int32
		terminationGracePeriodSeconds?: int64
		timeoutSeconds?:                int32
	}
}

#ProbeHandler: {
	exec?:      #ExecAction
	grpc?:      #GRPCAction
	httpGet?:   #HTTPGetAction
	tcpSocket?: #TCPSocketAction
}

#ProcMountType: string

#PullPolicy: string

#Quantity: string

#ResourceClaim: name: string

#ResourceList: [X=string]: #Quantity

#ResourceRequirements: {
	claims?: [...#ResourceClaim]
	limits?:   #ResourceList
	requests?: #ResourceList
}

#RestartPolicy: "Always" | "OnFailure" | "Never"

#RollingUpdateDaemonSet: {
	maxSurge?:       #IntOrString
	maxUnavailable?: #IntOrString
}

#RollingUpdateDeployment: {
	maxSurge?:       #IntOrString
	maxUnavailable?: #IntOrString
}

#RollingUpdateStatefulSetStrategy: {
	maxUnavailable?: #IntOrString
	partition?:      int32
}

#SELinuxOptions: {
	level?: string
	role?:  string
	type?:  string
	user?:  string
}

#ScopeType: "Cluster" | "Namespace"

#SeccompProfile: {
	localhostProfile?: string
	type:              #SeccompProfileType
}

#SeccompProfileType: string

#SecretVolumeSource: {
	defaultMode?: int32
	items?: [...#KeyToPath]
	optional?:   bool
	secretName?: string
}

#SecurityContext: {
	allowPrivilegeEscalation?: bool
	capabilities?:             #Capabilities
	privileged?:               bool
	procMount?:                #ProcMountType
	readOnlyRootFilesystem?:   bool
	runAsGroup?:               int64
	runAsNonRoot?:             bool
	runAsUser?:                int64
	seLinuxOptions?:           #SELinuxOptions
	seccompProfile?:           #SeccompProfile
	windowsOptions?:           #WindowsSecurityContextOptions
}

#Service: {
	clusterIP?: string
	expose?:    #Expose
	paths?: [X=string]: string
	ports?: [X=string]: int32
}

#ServiceAccount: {
	rules: [...#PolicyRule]
	scope?: #ScopeType
}

#Spec: {
	config?: [X=string]: #EnvVarValueOrFrom
	containers?: [X=string]: #Container
	deploy?:         #Deploy
	manifests?:      #Manifests
	serviceAccount?: #ServiceAccount
	services?: [X=string]: #Service
	version: string
	volumes?: [X=string]: #Volume
}

#SpecData: data: [X=string]: string

#StatefulSetOrdinals: start: int32

#StatefulSetPersistentVolumeClaimRetentionPolicy: {
	whenDeleted?: #PersistentVolumeClaimRetentionPolicyType
	whenScaled?:  #PersistentVolumeClaimRetentionPolicyType
}

#StatefulSetSpec: {
	minReadySeconds?:                      int32
	ordinals?:                             #StatefulSetOrdinals
	persistentVolumeClaimRetentionPolicy?: #StatefulSetPersistentVolumeClaimRetentionPolicy
	podManagementPolicy?:                  #PodManagementPolicyType
	replicas?:                             int32
	revisionHistoryLimit?:                 int32
	selector:                              #LabelSelector
	serviceName:                           string
	template:                              #PodTemplateSpec
	updateStrategy?:                       #StatefulSetUpdateStrategy
	volumeClaimTemplates?: [...#PersistentVolumeClaim]
}

#StatefulSetUpdateStrategy: {
	rollingUpdate?: #RollingUpdateStatefulSetStrategy
	type?:          #StatefulSetUpdateStrategyType
}

#StatefulSetUpdateStrategyType: string

#Status: {
	digests?: [...#DigestMeta]
	endpoint?: [X=string]: string
	images?: [X=string]: string
	resources?: [...{[X=string]: _}]
}

#Sysctl: {
	name:  string
	value: string
}

#TCPSocketAction: {
	host?: string
	port:  #IntOrString
}

#TaintEffect: string

#TerminationMessagePolicy: string

#Time: string

#Toleration: {
	effect?:            #TaintEffect
	key?:               string
	operator?:          #TolerationOperator
	tolerationSeconds?: int64
	value?:             string
}

#TolerationOperator: string

#TopologySpreadConstraint: {
	labelSelector?: #LabelSelector
	matchLabelKeys?: [...string]
	maxSkew:             int32
	minDomains?:         int32
	nodeAffinityPolicy?: #NodeInclusionPolicy
	nodeTaintsPolicy?:   #NodeInclusionPolicy
	topologyKey:         string
	whenUnsatisfiable:   #UnsatisfiableConstraintAction
}

#TypeMeta: {
	apiVersion?: string
	kind?:       string
}

#TypedLocalObjectReference: {
	apiGroup: string
	kind:     string
	name:     string
}

#TypedObjectReference: {
	apiGroup:   string
	kind:       string
	name:       string
	namespace?: string
}

#URIScheme: string

#UnsatisfiableConstraintAction: string

#Volume: {
	#VolumeMount
	{
		opt?:  #SecretVolumeSource
		spec?: #SpecData
		type:  "Secret"
	}
} | {
	#VolumeMount
	{
		opt?:  #ConfigMapVolumeSource
		spec?: #SpecData
		type:  "ConfigMap"
	}
} | {
	#VolumeMount
	{
		opt?: #PersistentVolumeClaimVolumeSource
		spec: #PersistentVolumeClaimSpec
		type: "PersistentVolumeClaim"
	}
}

#VolumeMount: {
	mountPath: string
	optional?: bool
	prefix?:   string
	readOnly?: bool
	subPath?:  string
}

#WeightedPodAffinityTerm: {
	podAffinityTerm: #PodAffinityTerm
	weight:          int32
}

#WindowsSecurityContextOptions: {
	gmsaCredentialSpec?:     string
	gmsaCredentialSpecName?: string
	hostProcess?:            bool
	runAsUserName?:          string
}
