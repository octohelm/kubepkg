import { createRequest } from "./client";

export type AccountId = string;

export interface DatatypesPrimaryId {}

export type DatatypesTimestamp = string;

export interface DatatypesCreationTime {
  createdAt: DatatypesTimestamp;
}

export interface DatatypesCreationUpdationTime extends DatatypesCreationTime {
  updatedAt: DatatypesTimestamp;
}

export interface DatatypesCreationUpdationDeletionTime
  extends DatatypesCreationUpdationTime {
  deletedAt?: DatatypesTimestamp;
}

export enum AccountType {
  USER = "USER",
  ROBOT = "ROBOT",
}

export interface Account
  extends DatatypesPrimaryId,
    DatatypesCreationUpdationDeletionTime {
  accountID: AccountId;
  accountType: keyof typeof AccountType;
}

export interface AccountUserInfo {
  email?: string;
  mobile?: string;
  nickname?: string;
}

export interface AccountUser extends Account, AccountUserInfo {}

export interface AccountUserDataList {
  data: Array<AccountUser>;
  total: number;
}

export const listAccount = /*#__PURE__*/ createRequest<
  {
    accountID?: Array<AccountId>;
    identity?: Array<string>;
    size?: number;
    offset?: number;
  },
  AccountUserDataList
>(
  "dashboard.ListAccount",
  ({
    accountID: query_accountId,
    identity: query_identity,
    size: query_size,
    offset: query_offset,
  }) => ({
    method: "GET",
    url: "/api/kubepkg-dashboard/v0/accounts",
    params: {
      accountID: query_accountId,
      identity: query_identity,
      size: query_size,
      offset: query_offset,
    },
  })
);

export enum GroupRoleType {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  GUEST = "GUEST",
}

export type GroupId = string;

export interface GroupAccount extends DatatypesCreationUpdationTime {
  accountID: AccountId;
  groupID: GroupId;
  roleType: keyof typeof GroupRoleType;
}

export interface GroupUser extends GroupAccount, AccountUserInfo {}

export interface GroupUserDataList {
  data: Array<GroupUser>;
  total: number;
}

export const listAdminAccount = /*#__PURE__*/ createRequest<
  {
    accountID?: Array<AccountId>;
    identity?: Array<string>;
    size?: number;
    offset?: number;
    roleType?: Array<keyof typeof GroupRoleType>;
  },
  GroupUserDataList
>(
  "dashboard.ListAdminAccount",
  ({
    accountID: query_accountId,
    identity: query_identity,
    size: query_size,
    offset: query_offset,
    roleType: query_roleType,
  }) => ({
    method: "GET",
    url: "/api/kubepkg-dashboard/v0/admin/accounts",
    params: {
      accountID: query_accountId,
      identity: query_identity,
      size: query_size,
      offset: query_offset,
      roleType: query_roleType,
    },
  })
);

export const deleteAdminAccount = /*#__PURE__*/ createRequest<
  {
    accountID: AccountId;
  },
  null
>("dashboard.DeleteAdminAccount", ({ accountID: path_accountId }) => ({
  method: "DELETE",
  url: `/api/kubepkg-dashboard/v0/admin/accounts/${path_accountId}`,
}));

export interface GroupRoleInfo {
  roleType: keyof typeof GroupRoleType;
}

export const putAdminAccount = /*#__PURE__*/ createRequest<
  {
    accountID: AccountId;
    body: GroupRoleInfo;
  },
  GroupAccount
>("dashboard.PutAdminAccount", ({ accountID: path_accountId, body: body }) => ({
  method: "PUT",
  url: `/api/kubepkg-dashboard/v0/admin/accounts/${path_accountId}`,
  body: body,
  headers: {
    "Content-Type": "application/json",
  },
}));

export interface AuthProviderInfo {
  name: string;
  type: string;
}

export const listAuthProvider = /*#__PURE__*/ createRequest<
  void,
  Array<AuthProviderInfo>
>("dashboard.ListAuthProvider", () => ({
  method: "GET",
  url: "/api/kubepkg-dashboard/v0/auth-providers",
}));

export const authorize = /*#__PURE__*/ createRequest<
  {
    name: string;
    state?: string;
  },
  null
>("dashboard.Authorize", ({ name: path_name, state: query_state }) => ({
  method: "GET",
  url: `/api/kubepkg-dashboard/v0/auth-providers/${path_name}/authorize`,
  params: {
    state: query_state,
  },
}));

export interface AuthExchangeTokenData {
  code: string;
}

export interface AuthToken {
  accessToken: string;
  id?: string;
  refreshToken?: string;
  type: string;
}

export const exchangeToken = /*#__PURE__*/ createRequest<
  {
    name: string;
    body: AuthExchangeTokenData;
  },
  AuthToken
>("dashboard.ExchangeToken", ({ name: path_name, body: body }) => ({
  method: "POST",
  url: `/api/kubepkg-dashboard/v0/auth-providers/${path_name}/token`,
  body: body,
  headers: {
    "Content-Type": "application/json",
  },
}));

export enum ClusterEnvType {
  DEV = "DEV",
  ONLINE = "ONLINE",
}

export enum ClusterNetType {
  DIRECT = "DIRECT",
  AIRGAP = "AIRGAP",
}

export interface ClusterInfo {
  desc?: string;
  endpoint?: string;
  envType: keyof typeof ClusterEnvType;
  netType: keyof typeof ClusterNetType;
}

export type ClusterId = string;

export interface Cluster
  extends ClusterInfo,
    DatatypesCreationUpdationDeletionTime {
  clusterID: ClusterId;
  name: string;
}

export const listCluster = /*#__PURE__*/ createRequest<void, Array<Cluster>>(
  "dashboard.ListCluster",
  () => ({
    method: "GET",
    url: "/api/kubepkg-dashboard/v0/clusters",
  })
);

export const putCluster = /*#__PURE__*/ createRequest<
  {
    name: string;
    body: ClusterInfo;
  },
  Cluster
>("dashboard.PutCluster", ({ name: path_name, body: body }) => ({
  method: "PUT",
  url: `/api/kubepkg-dashboard/v0/clusters/${path_name}`,
  body: body,
  headers: {
    "Content-Type": "application/json",
  },
}));

export const renameCluster = /*#__PURE__*/ createRequest<
  {
    name: string;
    newName: string;
  },
  Cluster
>("dashboard.RenameCluster", ({ name: path_name, newName: path_newName }) => ({
  method: "PUT",
  url: `/api/kubepkg-dashboard/v0/clusters/${path_name}/rename/${path_newName}`,
}));

export type StrfmtDuration = string;

export interface ClusterInstanceStatus {
  id: string;
  ping?: StrfmtDuration;
  supportedPlatforms?: Array<string>;
}

export const getClusterStatus = /*#__PURE__*/ createRequest<
  {
    name: string;
  },
  ClusterInstanceStatus
>("dashboard.GetClusterStatus", ({ name: path_name }) => ({
  method: "GET",
  url: `/api/kubepkg-dashboard/v0/clusters/${path_name}/status`,
}));

export enum GroupType {
  DEVELOP = "DEVELOP",
  DEPLOYMENT = "DEPLOYMENT",
}

export interface GroupInfo {
  desc?: string;
  type: keyof typeof GroupType;
}

export interface Group
  extends GroupInfo,
    DatatypesCreationUpdationDeletionTime {
  groupID: GroupId;
  name: string;
}

export const listGroup = /*#__PURE__*/ createRequest<void, Array<Group>>(
  "dashboard.ListGroup",
  () => ({
    method: "GET",
    url: "/api/kubepkg-dashboard/v0/groups",
  })
);

export const deleteGroup = /*#__PURE__*/ createRequest<
  {
    groupName: string;
  },
  null
>("dashboard.DeleteGroup", ({ groupName: path_groupName }) => ({
  method: "DELETE",
  url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}`,
}));

export const getGroup = /*#__PURE__*/ createRequest<
  {
    groupName: string;
  },
  Group
>("dashboard.GetGroup", ({ groupName: path_groupName }) => ({
  method: "GET",
  url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}`,
}));

export const putGroup = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    body: GroupInfo;
  },
  Group
>("dashboard.PutGroup", ({ groupName: path_groupName, body: body }) => ({
  method: "PUT",
  url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}`,
  body: body,
  headers: {
    "Content-Type": "application/json",
  },
}));

export const listGroupAccount = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    accountID?: Array<AccountId>;
    identity?: Array<string>;
    size?: number;
    offset?: number;
    roleType?: Array<keyof typeof GroupRoleType>;
  },
  GroupUserDataList
>(
  "dashboard.ListGroupAccount",
  ({
    groupName: path_groupName,
    accountID: query_accountId,
    identity: query_identity,
    size: query_size,
    offset: query_offset,
    roleType: query_roleType,
  }) => ({
    method: "GET",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/accounts`,
    params: {
      accountID: query_accountId,
      identity: query_identity,
      size: query_size,
      offset: query_offset,
      roleType: query_roleType,
    },
  })
);

export const deleteGroupAccount = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    accountID: AccountId;
  },
  null
>(
  "dashboard.DeleteGroupAccount",
  ({ groupName: path_groupName, accountID: path_accountId }) => ({
    method: "DELETE",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/accounts/${path_accountId}`,
  })
);

export const putGroupAccount = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    accountID: AccountId;
    body: GroupRoleInfo;
  },
  GroupAccount
>(
  "dashboard.PutGroupAccount",
  ({ groupName: path_groupName, accountID: path_accountId, body: body }) => ({
    method: "PUT",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/accounts/${path_accountId}`,
    body: body,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export enum GroupEnvType {
  DEV = "DEV",
  ONLINE = "ONLINE",
}

export interface GroupEnvInfo {
  desc: string;
  envType: keyof typeof GroupEnvType;
}

export interface GroupEnvCluster {
  namespace: string;
}

export type GroupEnvId = string;

export interface GroupEnv
  extends GroupEnvInfo,
    GroupEnvCluster,
    DatatypesCreationUpdationDeletionTime {
  envID: GroupEnvId;
  envName: string;
  groupID: GroupId;
}

export interface GroupEnvWithCluster extends GroupEnv {
  cluster?: Cluster;
}

export const listGroupEnv = /*#__PURE__*/ createRequest<
  {
    groupName: string;
  },
  Array<GroupEnvWithCluster>
>("dashboard.ListGroupEnv", ({ groupName: path_groupName }) => ({
  method: "GET",
  url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/envs`,
}));

export const deleteGroupEnv = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    envName: string;
  },
  null
>(
  "dashboard.DeleteGroupEnv",
  ({ groupName: path_groupName, envName: path_envName }) => ({
    method: "DELETE",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/envs/${path_envName}`,
  })
);

export const putGroupEnv = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    envName: string;
    body: GroupEnvInfo;
  },
  GroupEnvWithCluster
>(
  "dashboard.PutGroupEnv",
  ({ groupName: path_groupName, envName: path_envName, body: body }) => ({
    method: "PUT",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/envs/${path_envName}`,
    body: body,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export interface ApisMetaV1TypeMeta {
  apiVersion?: string;
  kind?: string;
}

export interface ApisMetaV1ObjectMeta {
  annotations?: {
    [k: string]: string;
  };
  labels?: {
    [k: string]: string;
  };
  name?: string;
  namespace?: string;
}

export type ApisKubepkgV1Alpha1EnvVarValueOrFrom = string;

export type K8SIoApiCoreV1PullPolicy = string;

export interface ApisKubepkgV1Alpha1Image {
  digest?: string;
  name: string;
  platforms?: Array<string>;
  pullPolicy?: K8SIoApiCoreV1PullPolicy;
  tag?: string;
}

export interface K8SIoApiCoreV1ExecAction {
  command?: Array<string>;
}

export interface K8SIoApiCoreV1HttpHeader {
  name: string;
  value: string;
}

export type UtilIntstrIntOrString = number | string;

export type K8SIoApiCoreV1UriScheme = string;

export interface K8SIoApiCoreV1HttpGetAction {
  host?: string;
  httpHeaders?: Array<K8SIoApiCoreV1HttpHeader>;
  path?: string;
  port: UtilIntstrIntOrString;
  scheme?: K8SIoApiCoreV1UriScheme;
}

export interface K8SIoApiCoreV1TcpSocketAction {
  host?: string;
  port: UtilIntstrIntOrString;
}

export interface K8SIoApiCoreV1LifecycleHandler {
  exec?: K8SIoApiCoreV1ExecAction;
  httpGet?: K8SIoApiCoreV1HttpGetAction;
  tcpSocket?: K8SIoApiCoreV1TcpSocketAction;
}

export interface K8SIoApiCoreV1Lifecycle {
  postStart?: K8SIoApiCoreV1LifecycleHandler;
  preStop?: K8SIoApiCoreV1LifecycleHandler;
}

export interface K8SIoApiCoreV1GrpcAction {
  port: number;
  service: string;
}

export interface K8SIoApiCoreV1ProbeHandler {
  exec?: K8SIoApiCoreV1ExecAction;
  grpc?: K8SIoApiCoreV1GrpcAction;
  httpGet?: K8SIoApiCoreV1HttpGetAction;
  tcpSocket?: K8SIoApiCoreV1TcpSocketAction;
}

export interface K8SIoApiCoreV1Probe extends K8SIoApiCoreV1ProbeHandler {
  failureThreshold?: number;
  initialDelaySeconds?: number;
  periodSeconds?: number;
  successThreshold?: number;
  terminationGracePeriodSeconds?: number;
  timeoutSeconds?: number;
}

export interface K8SIoApiCoreV1ResourceClaim {
  name: string;
}

export type K8SIoApiCoreV1ResourceName = string;

export type ApiResourceQuantity = string;

export interface K8SIoApiCoreV1ResourceList {
  [k: K8SIoApiCoreV1ResourceName]: ApiResourceQuantity;
}

export interface K8SIoApiCoreV1ResourceRequirements {
  claims?: Array<K8SIoApiCoreV1ResourceClaim>;
  limits?: K8SIoApiCoreV1ResourceList;
  requests?: K8SIoApiCoreV1ResourceList;
}

export type K8SIoApiCoreV1Capability = string;

export interface K8SIoApiCoreV1Capabilities {
  add?: Array<K8SIoApiCoreV1Capability>;
  drop?: Array<K8SIoApiCoreV1Capability>;
}

export type K8SIoApiCoreV1ProcMountType = string;

export interface K8SIoApiCoreV1SeLinuxOptions {
  level?: string;
  role?: string;
  type?: string;
  user?: string;
}

export type K8SIoApiCoreV1SeccompProfileType = string;

export interface K8SIoApiCoreV1SeccompProfile {
  localhostProfile?: string;
  type: K8SIoApiCoreV1SeccompProfileType;
}

export interface K8SIoApiCoreV1WindowsSecurityContextOptions {
  gmsaCredentialSpec?: string;
  gmsaCredentialSpecName?: string;
  hostProcess?: boolean;
  runAsUserName?: string;
}

export interface K8SIoApiCoreV1SecurityContext {
  allowPrivilegeEscalation?: boolean;
  capabilities?: K8SIoApiCoreV1Capabilities;
  privileged?: boolean;
  procMount?: K8SIoApiCoreV1ProcMountType;
  readOnlyRootFilesystem?: boolean;
  runAsGroup?: number;
  runAsNonRoot?: boolean;
  runAsUser?: number;
  seLinuxOptions?: K8SIoApiCoreV1SeLinuxOptions;
  seccompProfile?: K8SIoApiCoreV1SeccompProfile;
  windowsOptions?: K8SIoApiCoreV1WindowsSecurityContextOptions;
}

export type K8SIoApiCoreV1TerminationMessagePolicy = string;

export interface ApisKubepkgV1Alpha1Container {
  args?: Array<string>;
  command?: Array<string>;
  env?: {
    [k: string]: ApisKubepkgV1Alpha1EnvVarValueOrFrom;
  };
  image: ApisKubepkgV1Alpha1Image;
  lifecycle?: K8SIoApiCoreV1Lifecycle;
  livenessProbe?: K8SIoApiCoreV1Probe;
  ports?: {
    [k: string]: number;
  };
  readinessProbe?: K8SIoApiCoreV1Probe;
  resources?: K8SIoApiCoreV1ResourceRequirements;
  securityContext?: K8SIoApiCoreV1SecurityContext;
  startupProbe?: K8SIoApiCoreV1Probe;
  stdin?: boolean;
  stdinOnce?: boolean;
  terminationMessagePath?: string;
  terminationMessagePolicy?: K8SIoApiCoreV1TerminationMessagePolicy;
  tty?: boolean;
  workingDir?: string;
}

export type K8SIoApiBatchV1ConcurrencyPolicy = string;

export type K8SIoApiBatchV1CompletionMode = string;

export type K8SIoApiBatchV1PodFailurePolicyAction = string;

export type K8SIoApiBatchV1PodFailurePolicyOnExitCodesOperator = string;

export interface K8SIoApiBatchV1PodFailurePolicyOnExitCodesRequirement {
  containerName: string;
  operator: K8SIoApiBatchV1PodFailurePolicyOnExitCodesOperator;
  values: Array<number>;
}

export type K8SIoApiCoreV1ConditionStatus = string;

export type K8SIoApiCoreV1PodConditionType = string;

export interface K8SIoApiBatchV1PodFailurePolicyOnPodConditionsPattern {
  status: K8SIoApiCoreV1ConditionStatus;
  type: K8SIoApiCoreV1PodConditionType;
}

export interface K8SIoApiBatchV1PodFailurePolicyRule {
  action: K8SIoApiBatchV1PodFailurePolicyAction;
  onExitCodes: K8SIoApiBatchV1PodFailurePolicyOnExitCodesRequirement;
  onPodConditions: Array<K8SIoApiBatchV1PodFailurePolicyOnPodConditionsPattern>;
}

export interface K8SIoApiBatchV1PodFailurePolicy {
  rules: Array<K8SIoApiBatchV1PodFailurePolicyRule>;
}

export type ApisMetaV1LabelSelectorOperator = string;

export interface ApisMetaV1LabelSelectorRequirement {
  key: string;
  operator: ApisMetaV1LabelSelectorOperator;
  values?: Array<string>;
}

export interface ApisMetaV1LabelSelector {
  matchExpressions?: Array<ApisMetaV1LabelSelectorRequirement>;
  matchLabels?: {
    [k: string]: string;
  };
}

export type K8SIoApiCoreV1NodeSelectorOperator = string;

export interface K8SIoApiCoreV1NodeSelectorRequirement {
  key: string;
  operator: K8SIoApiCoreV1NodeSelectorOperator;
  values?: Array<string>;
}

export interface K8SIoApiCoreV1NodeSelectorTerm {
  matchExpressions?: Array<K8SIoApiCoreV1NodeSelectorRequirement>;
  matchFields?: Array<K8SIoApiCoreV1NodeSelectorRequirement>;
}

export interface K8SIoApiCoreV1PreferredSchedulingTerm {
  preference: K8SIoApiCoreV1NodeSelectorTerm;
  weight: number;
}

export interface K8SIoApiCoreV1NodeSelector {
  nodeSelectorTerms: Array<K8SIoApiCoreV1NodeSelectorTerm>;
}

export interface K8SIoApiCoreV1NodeAffinity {
  preferredDuringSchedulingIgnoredDuringExecution?: Array<K8SIoApiCoreV1PreferredSchedulingTerm>;
  requiredDuringSchedulingIgnoredDuringExecution?: K8SIoApiCoreV1NodeSelector;
}

export interface K8SIoApiCoreV1PodAffinityTerm {
  labelSelector?: ApisMetaV1LabelSelector;
  namespaceSelector?: ApisMetaV1LabelSelector;
  namespaces?: Array<string>;
  topologyKey: string;
}

export interface K8SIoApiCoreV1WeightedPodAffinityTerm {
  podAffinityTerm: K8SIoApiCoreV1PodAffinityTerm;
  weight: number;
}

export interface K8SIoApiCoreV1PodAffinity {
  preferredDuringSchedulingIgnoredDuringExecution?: Array<K8SIoApiCoreV1WeightedPodAffinityTerm>;
  requiredDuringSchedulingIgnoredDuringExecution?: Array<K8SIoApiCoreV1PodAffinityTerm>;
}

export interface K8SIoApiCoreV1PodAntiAffinity {
  preferredDuringSchedulingIgnoredDuringExecution?: Array<K8SIoApiCoreV1WeightedPodAffinityTerm>;
  requiredDuringSchedulingIgnoredDuringExecution?: Array<K8SIoApiCoreV1PodAffinityTerm>;
}

export interface K8SIoApiCoreV1Affinity {
  nodeAffinity?: K8SIoApiCoreV1NodeAffinity;
  podAffinity?: K8SIoApiCoreV1PodAffinity;
  podAntiAffinity?: K8SIoApiCoreV1PodAntiAffinity;
}

export interface K8SIoApiCoreV1PodDnsConfigOption {
  name?: string;
  value?: string;
}

export interface K8SIoApiCoreV1PodDnsConfig {
  nameservers?: Array<string>;
  options?: Array<K8SIoApiCoreV1PodDnsConfigOption>;
  searches?: Array<string>;
}

export type K8SIoApiCoreV1DnsPolicy = string;

export interface K8SIoApiCoreV1HostAlias {
  hostnames?: Array<string>;
  ip?: string;
}

export interface K8SIoApiCoreV1LocalObjectReference {
  name?: string;
}

export type K8SIoApiCoreV1OsName = string;

export interface K8SIoApiCoreV1PodOs {
  name: K8SIoApiCoreV1OsName;
}

export enum K8SIoApiCoreV1PreemptionPolicy {
  Never = "Never",
  PreemptLowerPriority = "PreemptLowerPriority",
}

export interface K8SIoApiCoreV1PodReadinessGate {
  conditionType: K8SIoApiCoreV1PodConditionType;
}

export interface K8SIoApiCoreV1ClaimSource {
  resourceClaimName?: string;
  resourceClaimTemplateName?: string;
}

export interface K8SIoApiCoreV1PodResourceClaim {
  name: string;
  source?: K8SIoApiCoreV1ClaimSource;
}

export enum K8SIoApiCoreV1RestartPolicy {
  Always = "Always",
  OnFailure = "OnFailure",
  Never = "Never",
}

export interface K8SIoApiCoreV1PodSchedulingGate {
  name: string;
}

export type K8SIoApiCoreV1PodFsGroupChangePolicy = string;

export interface K8SIoApiCoreV1Sysctl {
  name: string;
  value: string;
}

export interface K8SIoApiCoreV1PodSecurityContext {
  fsGroup?: number;
  fsGroupChangePolicy?: K8SIoApiCoreV1PodFsGroupChangePolicy;
  runAsGroup?: number;
  runAsNonRoot?: boolean;
  runAsUser?: number;
  seLinuxOptions?: K8SIoApiCoreV1SeLinuxOptions;
  seccompProfile?: K8SIoApiCoreV1SeccompProfile;
  supplementalGroups?: Array<number>;
  sysctls?: Array<K8SIoApiCoreV1Sysctl>;
  windowsOptions?: K8SIoApiCoreV1WindowsSecurityContextOptions;
}

export type K8SIoApiCoreV1TaintEffect = string;

export type K8SIoApiCoreV1TolerationOperator = string;

export interface K8SIoApiCoreV1Toleration {
  effect?: K8SIoApiCoreV1TaintEffect;
  key?: string;
  operator?: K8SIoApiCoreV1TolerationOperator;
  tolerationSeconds?: number;
  value?: string;
}

export type K8SIoApiCoreV1NodeInclusionPolicy = string;

export type K8SIoApiCoreV1UnsatisfiableConstraintAction = string;

export interface K8SIoApiCoreV1TopologySpreadConstraint {
  labelSelector?: ApisMetaV1LabelSelector;
  matchLabelKeys?: Array<string>;
  maxSkew: number;
  minDomains?: number;
  nodeAffinityPolicy?: K8SIoApiCoreV1NodeInclusionPolicy;
  nodeTaintsPolicy?: K8SIoApiCoreV1NodeInclusionPolicy;
  topologyKey: string;
  whenUnsatisfiable: K8SIoApiCoreV1UnsatisfiableConstraintAction;
}

export interface K8SIoApiCoreV1PodSpec {
  activeDeadlineSeconds?: number;
  affinity?: K8SIoApiCoreV1Affinity;
  automountServiceAccountToken?: boolean;
  dnsConfig?: K8SIoApiCoreV1PodDnsConfig;
  dnsPolicy?: K8SIoApiCoreV1DnsPolicy;
  enableServiceLinks?: boolean;
  hostAliases?: Array<K8SIoApiCoreV1HostAlias>;
  hostIPC?: boolean;
  hostNetwork?: boolean;
  hostPID?: boolean;
  hostUsers?: boolean;
  hostname?: string;
  imagePullSecrets?: Array<K8SIoApiCoreV1LocalObjectReference>;
  nodeName?: string;
  nodeSelector?: {
    [k: string]: string;
  };
  os?: K8SIoApiCoreV1PodOs;
  overhead?: K8SIoApiCoreV1ResourceList;
  preemptionPolicy?: keyof typeof K8SIoApiCoreV1PreemptionPolicy;
  priority?: number;
  priorityClassName?: string;
  readinessGates?: Array<K8SIoApiCoreV1PodReadinessGate>;
  resourceClaims?: Array<K8SIoApiCoreV1PodResourceClaim>;
  restartPolicy?: keyof typeof K8SIoApiCoreV1RestartPolicy;
  runtimeClassName?: string;
  schedulerName?: string;
  schedulingGates?: Array<K8SIoApiCoreV1PodSchedulingGate>;
  securityContext?: K8SIoApiCoreV1PodSecurityContext;
  serviceAccount?: string;
  serviceAccountName?: string;
  setHostnameAsFQDN?: boolean;
  shareProcessNamespace?: boolean;
  subdomain?: string;
  terminationGracePeriodSeconds?: number;
  tolerations?: Array<K8SIoApiCoreV1Toleration>;
  topologySpreadConstraints?: Array<K8SIoApiCoreV1TopologySpreadConstraint>;
}

export interface K8SIoApiCoreV1PodTemplateSpec {
  metadata?: ApisMetaV1ObjectMeta;
  spec?: K8SIoApiCoreV1PodSpec;
}

export interface K8SIoApiBatchV1JobSpec {
  activeDeadlineSeconds?: number;
  backoffLimit?: number;
  completionMode?: K8SIoApiBatchV1CompletionMode;
  completions?: number;
  manualSelector?: boolean;
  parallelism?: number;
  podFailurePolicy?: K8SIoApiBatchV1PodFailurePolicy;
  selector?: ApisMetaV1LabelSelector;
  suspend?: boolean;
  template: K8SIoApiCoreV1PodTemplateSpec;
  ttlSecondsAfterFinished?: number;
}

export interface K8SIoApiBatchV1JobTemplateSpec {
  metadata?: ApisMetaV1ObjectMeta;
  spec?: K8SIoApiBatchV1JobSpec;
}

export interface K8SIoApiBatchV1CronJobSpec {
  concurrencyPolicy?: K8SIoApiBatchV1ConcurrencyPolicy;
  failedJobsHistoryLimit?: number;
  jobTemplate: K8SIoApiBatchV1JobTemplateSpec;
  schedule: string;
  startingDeadlineSeconds?: number;
  successfulJobsHistoryLimit?: number;
  suspend?: boolean;
  timeZone?: string;
}

export interface K8SIoApiAppsV1RollingUpdateDaemonSet {
  maxSurge?: UtilIntstrIntOrString;
  maxUnavailable?: UtilIntstrIntOrString;
}

export enum K8SIoApiAppsV1DaemonSetUpdateStrategyType {
  RollingUpdate = "RollingUpdate",
  OnDelete = "OnDelete",
}

export interface K8SIoApiAppsV1DaemonSetUpdateStrategy {
  rollingUpdate?: K8SIoApiAppsV1RollingUpdateDaemonSet;
  type?: keyof typeof K8SIoApiAppsV1DaemonSetUpdateStrategyType;
}

export interface K8SIoApiAppsV1DaemonSetSpec {
  minReadySeconds?: number;
  revisionHistoryLimit?: number;
  selector: ApisMetaV1LabelSelector;
  template: K8SIoApiCoreV1PodTemplateSpec;
  updateStrategy?: K8SIoApiAppsV1DaemonSetUpdateStrategy;
}

export interface K8SIoApiAppsV1RollingUpdateDeployment {
  maxSurge?: UtilIntstrIntOrString;
  maxUnavailable?: UtilIntstrIntOrString;
}

export enum K8SIoApiAppsV1DeploymentStrategyType {
  Recreate = "Recreate",
  RollingUpdate = "RollingUpdate",
}

export interface K8SIoApiAppsV1DeploymentStrategy {
  rollingUpdate?: K8SIoApiAppsV1RollingUpdateDeployment;
  type?: keyof typeof K8SIoApiAppsV1DeploymentStrategyType;
}

export interface K8SIoApiAppsV1DeploymentSpec {
  minReadySeconds?: number;
  paused?: boolean;
  progressDeadlineSeconds?: number;
  replicas?: number;
  revisionHistoryLimit?: number;
  selector: ApisMetaV1LabelSelector;
  strategy?: K8SIoApiAppsV1DeploymentStrategy;
  template: K8SIoApiCoreV1PodTemplateSpec;
}

export interface K8SIoApiAppsV1StatefulSetOrdinals {
  start: number;
}

export type K8SIoApiAppsV1PersistentVolumeClaimRetentionPolicyType = string;

export interface K8SIoApiAppsV1StatefulSetPersistentVolumeClaimRetentionPolicy {
  whenDeleted?: K8SIoApiAppsV1PersistentVolumeClaimRetentionPolicyType;
  whenScaled?: K8SIoApiAppsV1PersistentVolumeClaimRetentionPolicyType;
}

export type K8SIoApiAppsV1PodManagementPolicyType = string;

export interface K8SIoApiAppsV1RollingUpdateStatefulSetStrategy {
  maxUnavailable?: UtilIntstrIntOrString;
  partition?: number;
}

export type K8SIoApiAppsV1StatefulSetUpdateStrategyType = string;

export interface K8SIoApiAppsV1StatefulSetUpdateStrategy {
  rollingUpdate?: K8SIoApiAppsV1RollingUpdateStatefulSetStrategy;
  type?: K8SIoApiAppsV1StatefulSetUpdateStrategyType;
}

export type K8SIoApiCoreV1PersistentVolumeAccessMode = string;

export interface K8SIoApiCoreV1TypedLocalObjectReference {
  apiGroup: string;
  kind: string;
  name: string;
}

export interface K8SIoApiCoreV1TypedObjectReference {
  apiGroup: string;
  kind: string;
  name: string;
  namespace?: string;
}

export type K8SIoApiCoreV1PersistentVolumeMode = string;

export interface K8SIoApiCoreV1PersistentVolumeClaimSpec {
  accessModes?: Array<K8SIoApiCoreV1PersistentVolumeAccessMode>;
  dataSource?: K8SIoApiCoreV1TypedLocalObjectReference;
  dataSourceRef?: K8SIoApiCoreV1TypedObjectReference;
  resources?: K8SIoApiCoreV1ResourceRequirements;
  selector?: ApisMetaV1LabelSelector;
  storageClassName?: string;
  volumeMode?: K8SIoApiCoreV1PersistentVolumeMode;
  volumeName?: string;
}

export type ApisMetaV1Time = string;

export type K8SIoApiCoreV1PersistentVolumeClaimConditionType = string;

export interface K8SIoApiCoreV1PersistentVolumeClaimCondition {
  lastProbeTime?: ApisMetaV1Time;
  lastTransitionTime?: ApisMetaV1Time;
  message?: string;
  reason?: string;
  status: K8SIoApiCoreV1ConditionStatus;
  type: K8SIoApiCoreV1PersistentVolumeClaimConditionType;
}

export type K8SIoApiCoreV1PersistentVolumeClaimPhase = string;

export type K8SIoApiCoreV1PersistentVolumeClaimResizeStatus = string;

export interface K8SIoApiCoreV1PersistentVolumeClaimStatus {
  accessModes?: Array<K8SIoApiCoreV1PersistentVolumeAccessMode>;
  allocatedResources?: K8SIoApiCoreV1ResourceList;
  capacity?: K8SIoApiCoreV1ResourceList;
  conditions?: Array<K8SIoApiCoreV1PersistentVolumeClaimCondition>;
  phase?: K8SIoApiCoreV1PersistentVolumeClaimPhase;
  resizeStatus?: K8SIoApiCoreV1PersistentVolumeClaimResizeStatus;
}

export interface K8SIoApiCoreV1PersistentVolumeClaim
  extends ApisMetaV1TypeMeta {
  metadata?: ApisMetaV1ObjectMeta;
  spec?: K8SIoApiCoreV1PersistentVolumeClaimSpec;
  status?: K8SIoApiCoreV1PersistentVolumeClaimStatus;
}

export interface K8SIoApiAppsV1StatefulSetSpec {
  minReadySeconds?: number;
  ordinals?: K8SIoApiAppsV1StatefulSetOrdinals;
  persistentVolumeClaimRetentionPolicy?: K8SIoApiAppsV1StatefulSetPersistentVolumeClaimRetentionPolicy;
  podManagementPolicy?: K8SIoApiAppsV1PodManagementPolicyType;
  replicas?: number;
  revisionHistoryLimit?: number;
  selector: ApisMetaV1LabelSelector;
  serviceName: string;
  template: K8SIoApiCoreV1PodTemplateSpec;
  updateStrategy?: K8SIoApiAppsV1StatefulSetUpdateStrategy;
  volumeClaimTemplates?: Array<K8SIoApiCoreV1PersistentVolumeClaim>;
}

export type ApisKubepkgV1Alpha1Deploy =
  | {
      annotations?: {
        [k: string]: string;
      };
      kind: "ConfigMap";
    }
  | {
      annotations?: {
        [k: string]: string;
      };
      kind: "CronJob";
      spec?: K8SIoApiBatchV1CronJobSpec;
    }
  | {
      annotations?: {
        [k: string]: string;
      };
      kind: "DaemonSet";
      spec?: K8SIoApiAppsV1DaemonSetSpec;
    }
  | {
      annotations?: {
        [k: string]: string;
      };
      kind: "Deployment";
      spec?: K8SIoApiAppsV1DeploymentSpec;
    }
  | {
      annotations?: {
        [k: string]: string;
      };
      kind: "Job";
      spec?: K8SIoApiBatchV1JobSpec;
    }
  | {
      annotations?: {
        [k: string]: string;
      };
      kind: "Secret";
    }
  | {
      annotations?: {
        [k: string]: string;
      };
      kind: "StatefulSet";
      spec?: K8SIoApiAppsV1StatefulSetSpec;
    };

export interface ApisKubepkgV1Alpha1Manifests {
  [k: string]: any;
}

export interface K8SIoApiRbacV1PolicyRule {
  apiGroups?: Array<string>;
  nonResourceURLs?: Array<string>;
  resourceNames?: Array<string>;
  resources?: Array<string>;
  verbs: Array<string>;
}

export enum ApisKubepkgV1Alpha1ScopeType {
  Cluster = "Cluster",
  Namespace = "Namespace",
}

export interface ApisKubepkgV1Alpha1ServiceAccount {
  rules: Array<K8SIoApiRbacV1PolicyRule>;
  scope?: keyof typeof ApisKubepkgV1Alpha1ScopeType;
}

export interface ApisKubepkgV1Alpha1Expose {
  gateway?: Array<string>;
  type: string;
}

export interface ApisKubepkgV1Alpha1Service {
  clusterIP?: string;
  expose?: ApisKubepkgV1Alpha1Expose;
  paths?: {
    [k: string]: string;
  };
  ports?: {
    [k: string]: number;
  };
}

export interface ApisKubepkgV1Alpha1VolumeMount {
  mountPath: string;
  optional?: boolean;
  prefix?: string;
  readOnly?: boolean;
  subPath?: string;
}

export interface K8SIoApiCoreV1KeyToPath {
  key: string;
  mode?: number;
  path: string;
}

export interface K8SIoApiCoreV1ConfigMapVolumeSource
  extends K8SIoApiCoreV1LocalObjectReference {
  defaultMode?: number;
  items?: Array<K8SIoApiCoreV1KeyToPath>;
  optional?: boolean;
}

export interface ApisKubepkgV1Alpha1SpecData {
  data: {
    [k: string]: string;
  };
}

export type K8SIoApiCoreV1StorageMedium = string;

export interface K8SIoApiCoreV1EmptyDirVolumeSource {
  medium?: K8SIoApiCoreV1StorageMedium;
  sizeLimit?: ApiResourceQuantity;
}

export type K8SIoApiCoreV1HostPathType = string;

export interface K8SIoApiCoreV1HostPathVolumeSource {
  path: string;
  type?: K8SIoApiCoreV1HostPathType;
}

export interface K8SIoApiCoreV1PersistentVolumeClaimVolumeSource {
  claimName: string;
  readOnly?: boolean;
}

export interface K8SIoApiCoreV1SecretVolumeSource {
  defaultMode?: number;
  items?: Array<K8SIoApiCoreV1KeyToPath>;
  optional?: boolean;
  secretName?: string;
}

export type ApisKubepkgV1Alpha1Volume =
  | (ApisKubepkgV1Alpha1VolumeMount & {
      opt?: K8SIoApiCoreV1ConfigMapVolumeSource;
      spec?: ApisKubepkgV1Alpha1SpecData;
      type: "ConfigMap";
    })
  | (ApisKubepkgV1Alpha1VolumeMount & {
      opt?: K8SIoApiCoreV1EmptyDirVolumeSource;
      type: "EmptyDir";
    })
  | (ApisKubepkgV1Alpha1VolumeMount & {
      opt?: K8SIoApiCoreV1HostPathVolumeSource;
      type: "HostPath";
    })
  | (ApisKubepkgV1Alpha1VolumeMount & {
      opt?: K8SIoApiCoreV1PersistentVolumeClaimVolumeSource;
      spec: K8SIoApiCoreV1PersistentVolumeClaimSpec;
      type: "PersistentVolumeClaim";
    })
  | (ApisKubepkgV1Alpha1VolumeMount & {
      opt?: K8SIoApiCoreV1SecretVolumeSource;
      spec?: ApisKubepkgV1Alpha1SpecData;
      type: "Secret";
    });

export interface ApisKubepkgV1Alpha1Spec {
  config?: {
    [k: string]: ApisKubepkgV1Alpha1EnvVarValueOrFrom;
  };
  containers?: {
    [k: string]: ApisKubepkgV1Alpha1Container;
  };
  deploy?: ApisKubepkgV1Alpha1Deploy;
  manifests?: ApisKubepkgV1Alpha1Manifests;
  serviceAccount?: ApisKubepkgV1Alpha1ServiceAccount;
  services?: {
    [k: string]: ApisKubepkgV1Alpha1Service;
  };
  version: string;
  volumes?: {
    [k: string]: ApisKubepkgV1Alpha1Volume;
  };
}

export type ApisKubepkgV1Alpha1FileSize = number;

export enum ApisKubepkgV1Alpha1DigestMetaType {
  blob = "blob",
  manifest = "manifest",
}

export interface ApisKubepkgV1Alpha1DigestMeta {
  digest: string;
  name: string;
  platform?: string;
  size: ApisKubepkgV1Alpha1FileSize;
  tag?: string;
  type: keyof typeof ApisKubepkgV1Alpha1DigestMetaType;
}

export interface ApisKubepkgV1Alpha1Status {
  digests?: Array<ApisKubepkgV1Alpha1DigestMeta>;
  endpoint?: {
    [k: string]: string;
  };
  images?: {
    [k: string]: string;
  };
  resources?: Array<{
    [k: string]: any;
  }>;
}

export interface ApisKubepkgV1Alpha1KubePkg extends ApisMetaV1TypeMeta {
  metadata?: ApisMetaV1ObjectMeta;
  spec: ApisKubepkgV1Alpha1Spec;
  status?: ApisKubepkgV1Alpha1Status;
}

export const listGroupEnvClusterDeployments = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    envName: string;
  },
  Array<ApisKubepkgV1Alpha1KubePkg>
>(
  "dashboard.ListGroupEnvClusterDeployments",
  ({ groupName: path_groupName, envName: path_envName }) => ({
    method: "GET",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/envs/${path_envName}/cluster/deployments`,
  })
);

export const unbindGroupEnvCluster = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    envName: string;
    clusterID: ClusterId;
  },
  GroupEnvWithCluster
>(
  "dashboard.UnbindGroupEnvCluster",
  ({
    groupName: path_groupName,
    envName: path_envName,
    clusterID: path_clusterId,
  }) => ({
    method: "DELETE",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/envs/${path_envName}/clusters/${path_clusterId}`,
  })
);

export const bindGroupEnvCluster = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    envName: string;
    clusterID: ClusterId;
  },
  GroupEnvWithCluster
>(
  "dashboard.BindGroupEnvCluster",
  ({
    groupName: path_groupName,
    envName: path_envName,
    clusterID: path_clusterId,
  }) => ({
    method: "PUT",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/envs/${path_envName}/clusters/${path_clusterId}`,
  })
);

export interface ApisMetaV1ListMeta {
  continue?: string;
  remainingItemCount?: number;
  resourceVersion?: string;
  selfLink?: string;
}

export interface ApisKubepkgV1Alpha1KubePkgList extends ApisMetaV1TypeMeta {
  items: Array<ApisKubepkgV1Alpha1KubePkg>;
  metadata?: ApisMetaV1ListMeta;
}

export const listGroupEnvDeployment = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    envName: string;
    raw?: boolean;
    size?: number;
    offset?: number;
  },
  ApisKubepkgV1Alpha1KubePkgList
>(
  "dashboard.ListGroupEnvDeployment",
  ({
    groupName: path_groupName,
    envName: path_envName,
    raw: query_raw,
    size: query_size,
    offset: query_offset,
  }) => ({
    method: "GET",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/envs/${path_envName}/deployments`,
    params: {
      raw: query_raw,
      size: query_size,
      offset: query_offset,
    },
  })
);

export const putGroupEnvDeployment = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    envName: string;
    body: ApisKubepkgV1Alpha1KubePkg;
  },
  ApisKubepkgV1Alpha1KubePkg
>(
  "dashboard.PutGroupEnvDeployment",
  ({ groupName: path_groupName, envName: path_envName, body: body }) => ({
    method: "PUT",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/envs/${path_envName}/deployments`,
    body: body,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export type GroupDeploymentId = string;

export const listGroupEnvDeploymentHistory = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    envName: string;
    deploymentID: GroupDeploymentId;
    size?: number;
    offset?: number;
  },
  Array<ApisKubepkgV1Alpha1KubePkg>
>(
  "dashboard.ListGroupEnvDeploymentHistory",
  ({
    groupName: path_groupName,
    envName: path_envName,
    deploymentID: path_deploymentId,
    size: query_size,
    offset: query_offset,
  }) => ({
    method: "GET",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/envs/${path_envName}/deployments/${path_deploymentId}/histories`,
    params: {
      size: query_size,
      offset: query_offset,
    },
  })
);

export const deleteGroupEnvDeployment = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    envName: string;
    deploymentName: string;
  },
  null
>(
  "dashboard.DeleteGroupEnvDeployment",
  ({
    groupName: path_groupName,
    envName: path_envName,
    deploymentName: path_deploymentName,
  }) => ({
    method: "DELETE",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/envs/${path_envName}/deployments/${path_deploymentName}`,
  })
);

export type KubepkgId = string;

export interface Kubepkg extends DatatypesCreationUpdationDeletionTime {
  group: string;
  kubepkgID: KubepkgId;
  name: string;
}

export const listKubepkg = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    name?: Array<string>;
    size?: number;
    offset?: number;
  },
  Array<Kubepkg>
>(
  "dashboard.ListKubepkg",
  ({
    groupName: path_groupName,
    name: query_name,
    size: query_size,
    offset: query_offset,
  }) => ({
    method: "GET",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/kubepkgs`,
    params: {
      name: query_name,
      size: query_size,
      offset: query_offset,
    },
  })
);

export enum KubepkgChannel {
  DEV = "DEV",
  BETA = "BETA",
  RC = "RC",
  STABLE = "STABLE",
}

export type KubepkgRevisionId = string;

export const getKubepkgRevision = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    name: string;
    channel: keyof typeof KubepkgChannel;
    revisionID: KubepkgRevisionId;
  },
  ApisKubepkgV1Alpha1KubePkg
>(
  "dashboard.GetKubepkgRevision",
  ({
    groupName: path_groupName,
    name: path_name,
    channel: path_channel,
    revisionID: path_revisionId,
  }) => ({
    method: "GET",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/kubepkgs/${path_name}/${path_channel}/revisions/${path_revisionId}`,
  })
);

export interface KubepkgVersionInfo {
  revisionID: KubepkgRevisionId;
  version: string;
}

export const listKubepkgVersion = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    name: string;
    channel: keyof typeof KubepkgChannel;
  },
  Array<KubepkgVersionInfo>
>(
  "dashboard.ListKubepkgVersion",
  ({ groupName: path_groupName, name: path_name, channel: path_channel }) => ({
    method: "GET",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/kubepkgs/${path_name}/${path_channel}/versions`,
  })
);

export const putKubepkgVersion = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    name: string;
    channel: keyof typeof KubepkgChannel;
    body: KubepkgVersionInfo;
  },
  null
>(
  "dashboard.PutKubepkgVersion",
  ({
    groupName: path_groupName,
    name: path_name,
    channel: path_channel,
    body: body,
  }) => ({
    method: "PUT",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/kubepkgs/${path_name}/${path_channel}/versions`,
    body: body,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export const deleteKubepkgVersion = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    name: string;
    channel: keyof typeof KubepkgChannel;
    version: string;
  },
  null
>(
  "dashboard.DeleteKubepkgVersion",
  ({
    groupName: path_groupName,
    name: path_name,
    channel: path_channel,
    version: path_version,
  }) => ({
    method: "DELETE",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/kubepkgs/${path_name}/${path_channel}/versions/${path_version}`,
  })
);

export interface AccountRobotInfo {
  name: string;
}

export interface GroupRobot extends GroupAccount, AccountRobotInfo {}

export interface GroupRobotDataList {
  data: Array<GroupRobot>;
  total: number;
}

export const listGroupRobot = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    accountID?: Array<AccountId>;
    identity?: Array<string>;
    size?: number;
    offset?: number;
    roleType?: Array<keyof typeof GroupRoleType>;
  },
  GroupRobotDataList
>(
  "dashboard.ListGroupRobot",
  ({
    groupName: path_groupName,
    accountID: query_accountId,
    identity: query_identity,
    size: query_size,
    offset: query_offset,
    roleType: query_roleType,
  }) => ({
    method: "GET",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/robots`,
    params: {
      accountID: query_accountId,
      identity: query_identity,
      size: query_size,
      offset: query_offset,
      roleType: query_roleType,
    },
  })
);

export interface AccountRobot extends Account, AccountRobotInfo {}

export const createGroupRobot = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    body: AccountRobotInfo;
  },
  AccountRobot
>(
  "dashboard.CreateGroupRobot",
  ({ groupName: path_groupName, body: body }) => ({
    method: "PUT",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/robots`,
    body: body,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export interface GroupRefreshGroupRobotTokenData extends GroupRoleInfo {
  expiresIn: number;
}

export const refreshGroupRobotToken = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    robotID: AccountId;
    body: GroupRefreshGroupRobotTokenData;
  },
  AuthToken
>(
  "dashboard.RefreshGroupRobotToken",
  ({ groupName: path_groupName, robotID: path_robotId, body: body }) => ({
    method: "PUT",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/robots/${path_robotId}/tokens`,
    body: body,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export const latestKubepkgs = /*#__PURE__*/ createRequest<
  {
    names: Array<string>;
  },
  {
    [k: string]: KubepkgVersionInfo;
  }
>("dashboard.LatestKubepkgs", ({ names: query_names }) => ({
  method: "GET",
  url: "/api/kubepkg-dashboard/v0/latest-kubepkgs",
  params: {
    names: query_names,
  },
}));

export interface AuthOperatorAccount extends AccountUser {
  accountType: keyof typeof AccountType;
  adminRole: keyof typeof GroupRoleType;
  groupRoles?: {
    [k: GroupId]: keyof typeof GroupRoleType;
  };
}

export const currentUser = /*#__PURE__*/ createRequest<
  void,
  AuthOperatorAccount
>("dashboard.CurrentUser", () => ({
  method: "GET",
  url: "/api/kubepkg-dashboard/v0/user",
}));

export interface RbacPermissions {
  [k: string]: Array<any>;
}

export const currentPermissions = /*#__PURE__*/ createRequest<
  void,
  RbacPermissions
>("dashboard.CurrentPermissions", () => ({
  method: "GET",
  url: "/api/kubepkg-dashboard/v0/user/permissions",
}));

export const RawOpenAPI = {
  openapi: "3.1.0",
  info: {
    title: "",
    version: "",
  },
  paths: {
    "/api/kubepkg-dashboard": {
      get: {
        tags: ["httprouter"],
        operationId: "OpenAPI",
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {},
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/accounts": {
      get: {
        tags: ["admin"],
        operationId: "ListAccount",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "accountID",
            in: "query",
            schema: {
              type: "array",
              items: {
                $ref: "#/components/schemas/AccountId",
              },
            },
          },
          {
            name: "identity",
            in: "query",
            schema: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          {
            name: "size",
            in: "query",
            schema: {
              type: "integer",
              format: "int64",
            },
          },
          {
            name: "offset",
            in: "query",
            schema: {
              type: "integer",
              format: "int64",
            },
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AccountUserDataList",
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/admin/accounts": {
      get: {
        tags: ["admin"],
        operationId: "ListAdminAccount",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "accountID",
            in: "query",
            schema: {
              type: "array",
              items: {
                $ref: "#/components/schemas/AccountId",
              },
            },
          },
          {
            name: "identity",
            in: "query",
            schema: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          {
            name: "size",
            in: "query",
            schema: {
              type: "integer",
              format: "int64",
            },
          },
          {
            name: "offset",
            in: "query",
            schema: {
              type: "integer",
              format: "int64",
            },
          },
          {
            name: "roleType",
            in: "query",
            schema: {
              type: "array",
              items: {
                $ref: "#/components/schemas/GroupRoleType",
              },
            },
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/GroupUserDataList",
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/admin/accounts/{accountID}": {
      delete: {
        tags: ["admin"],
        operationId: "DeleteAdminAccount",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "accountID",
            in: "path",
            required: true,
            schema: {
              $ref: "#/components/schemas/AccountId",
            },
          },
        ],
        responses: {
          "200": {
            description: "",
          },
        },
      },
      put: {
        tags: ["admin"],
        operationId: "PutAdminAccount",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "accountID",
            in: "path",
            required: true,
            schema: {
              $ref: "#/components/schemas/AccountId",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                allOf: [
                  {
                    $ref: "#/components/schemas/GroupRoleInfo",
                  },
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/GroupAccount",
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/auth-providers": {
      get: {
        tags: ["auth"],
        operationId: "ListAuthProvider",
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    allOf: [
                      {
                        $ref: "#/components/schemas/AuthProviderInfo",
                      },
                    ],
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/auth-providers/{name}/authorize": {
      get: {
        tags: ["auth"],
        operationId: "Authorize",
        parameters: [
          {
            name: "name",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "state",
            in: "query",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {},
            },
          },
          "400": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StatuserrorStatusErr",
                },
              },
            },
            "x-status-returnErrors": [
              'StatusError{key="ToAuthorizeFailed",msg="ToAuthorizeFailed",code=400}',
            ],
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/auth-providers/{name}/token": {
      post: {
        tags: ["auth"],
        operationId: "ExchangeToken",
        parameters: [
          {
            name: "name",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                allOf: [
                  {
                    $ref: "#/components/schemas/AuthExchangeTokenData",
                  },
                ],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthToken",
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/clusters": {
      get: {
        tags: ["cluster"],
        operationId: "ListCluster",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    allOf: [
                      {
                        $ref: "#/components/schemas/Cluster",
                      },
                    ],
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/clusters/{name}": {
      put: {
        tags: ["cluster"],
        operationId: "PutCluster",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "name",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                allOf: [
                  {
                    $ref: "#/components/schemas/ClusterInfo",
                  },
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Cluster",
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/clusters/{name}/rename/{newName}": {
      put: {
        tags: ["cluster"],
        operationId: "RenameCluster",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "name",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "newName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Cluster",
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/clusters/{name}/status": {
      get: {
        tags: ["cluster"],
        operationId: "GetClusterStatus",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "name",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ClusterInstanceStatus",
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/groups": {
      get: {
        tags: ["group"],
        operationId: "ListGroup",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    allOf: [
                      {
                        $ref: "#/components/schemas/Group",
                      },
                    ],
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/groups/{groupName}": {
      delete: {
        tags: ["group"],
        operationId: "DeleteGroup",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "groupName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "",
          },
        },
      },
      get: {
        tags: ["group"],
        operationId: "GetGroup",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "groupName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Group",
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["group"],
        operationId: "PutGroup",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "groupName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                allOf: [
                  {
                    $ref: "#/components/schemas/GroupInfo",
                  },
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Group",
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/groups/{groupName}/accounts": {
      get: {
        tags: ["group"],
        operationId: "ListGroupAccount",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "groupName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "accountID",
            in: "query",
            schema: {
              type: "array",
              items: {
                $ref: "#/components/schemas/AccountId",
              },
            },
          },
          {
            name: "identity",
            in: "query",
            schema: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          {
            name: "size",
            in: "query",
            schema: {
              type: "integer",
              format: "int64",
            },
          },
          {
            name: "offset",
            in: "query",
            schema: {
              type: "integer",
              format: "int64",
            },
          },
          {
            name: "roleType",
            in: "query",
            schema: {
              type: "array",
              items: {
                $ref: "#/components/schemas/GroupRoleType",
              },
            },
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/GroupUserDataList",
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/groups/{groupName}/accounts/{accountID}": {
      delete: {
        tags: ["group"],
        operationId: "DeleteGroupAccount",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "groupName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "accountID",
            in: "path",
            required: true,
            schema: {
              $ref: "#/components/schemas/AccountId",
            },
          },
        ],
        responses: {
          "200": {
            description: "",
          },
        },
      },
      put: {
        tags: ["group"],
        operationId: "PutGroupAccount",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "groupName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "accountID",
            in: "path",
            required: true,
            schema: {
              $ref: "#/components/schemas/AccountId",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                allOf: [
                  {
                    $ref: "#/components/schemas/GroupRoleInfo",
                  },
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/GroupAccount",
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/groups/{groupName}/envs": {
      get: {
        tags: ["group"],
        operationId: "ListGroupEnv",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "groupName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    allOf: [
                      {
                        $ref: "#/components/schemas/GroupEnvWithCluster",
                      },
                    ],
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/groups/{groupName}/envs/{envName}": {
      delete: {
        tags: ["group"],
        operationId: "DeleteGroupEnv",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "groupName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "envName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "",
          },
        },
      },
      put: {
        tags: ["group"],
        operationId: "PutGroupEnv",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "groupName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "envName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                allOf: [
                  {
                    $ref: "#/components/schemas/GroupEnvInfo",
                  },
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/GroupEnvWithCluster",
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/groups/{groupName}/envs/{envName}/cluster/deployments":
      {
        get: {
          tags: ["group"],
          operationId: "ListGroupEnvClusterDeployments",
          parameters: [
            {
              name: "Authorization",
              in: "header",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "groupName",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "envName",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/ApisKubepkgV1Alpha1KubePkg",
                    },
                  },
                },
              },
            },
            "403": {
              description: "",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/StatuserrorStatusErr",
                  },
                },
              },
              "x-status-returnErrors": [
                'StatusError{key="NotBindCluster",msg="NotBindCluster",code=403}',
              ],
            },
          },
        },
      },
    "/api/kubepkg-dashboard/v0/groups/{groupName}/envs/{envName}/clusters/{clusterID}":
      {
        delete: {
          tags: ["group"],
          operationId: "UnbindGroupEnvCluster",
          parameters: [
            {
              name: "Authorization",
              in: "header",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "groupName",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "envName",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "clusterID",
              in: "path",
              required: true,
              schema: {
                $ref: "#/components/schemas/ClusterId",
              },
            },
          ],
          responses: {
            "200": {
              description: "",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/GroupEnvWithCluster",
                  },
                },
              },
            },
          },
        },
        put: {
          tags: ["group"],
          operationId: "BindGroupEnvCluster",
          parameters: [
            {
              name: "Authorization",
              in: "header",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "groupName",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "envName",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "clusterID",
              in: "path",
              required: true,
              schema: {
                $ref: "#/components/schemas/ClusterId",
              },
            },
          ],
          responses: {
            "200": {
              description: "",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/GroupEnvWithCluster",
                  },
                },
              },
            },
          },
        },
      },
    "/api/kubepkg-dashboard/v0/groups/{groupName}/envs/{envName}/deployments": {
      get: {
        tags: ["group"],
        operationId: "ListGroupEnvDeployment",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "groupName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "envName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "raw",
            in: "query",
            schema: {
              type: "boolean",
            },
          },
          {
            name: "size",
            in: "query",
            schema: {
              type: "integer",
              format: "int64",
            },
          },
          {
            name: "offset",
            in: "query",
            schema: {
              type: "integer",
              format: "int64",
            },
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApisKubepkgV1Alpha1KubePkgList",
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["group"],
        operationId: "PutGroupEnvDeployment",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "groupName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "envName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                allOf: [
                  {
                    $ref: "#/components/schemas/ApisKubepkgV1Alpha1KubePkg",
                  },
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApisKubepkgV1Alpha1KubePkg",
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/groups/{groupName}/envs/{envName}/deployments/{deploymentID}/histories":
      {
        get: {
          tags: ["group"],
          operationId: "ListGroupEnvDeploymentHistory",
          parameters: [
            {
              name: "Authorization",
              in: "header",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "groupName",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "envName",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "deploymentID",
              in: "path",
              required: true,
              schema: {
                $ref: "#/components/schemas/GroupDeploymentId",
              },
            },
            {
              name: "size",
              in: "query",
              schema: {
                type: "integer",
                format: "int64",
              },
            },
            {
              name: "offset",
              in: "query",
              schema: {
                type: "integer",
                format: "int64",
              },
            },
          ],
          responses: {
            "200": {
              description: "",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      allOf: [
                        {
                          $ref: "#/components/schemas/ApisKubepkgV1Alpha1KubePkg",
                        },
                      ],
                      nullable: true,
                      "x-go-star-level": 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    "/api/kubepkg-dashboard/v0/groups/{groupName}/envs/{envName}/deployments/{deploymentName}":
      {
        delete: {
          tags: ["group"],
          operationId: "DeleteGroupEnvDeployment",
          parameters: [
            {
              name: "Authorization",
              in: "header",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "groupName",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "envName",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "deploymentName",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "",
            },
          },
        },
      },
    "/api/kubepkg-dashboard/v0/groups/{groupName}/kubepkgs": {
      get: {
        tags: ["kubepkg"],
        operationId: "ListKubepkg",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "groupName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "name",
            in: "query",
            schema: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          {
            name: "size",
            in: "query",
            schema: {
              type: "integer",
              format: "int64",
            },
          },
          {
            name: "offset",
            in: "query",
            schema: {
              type: "integer",
              format: "int64",
            },
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    allOf: [
                      {
                        $ref: "#/components/schemas/Kubepkg",
                      },
                    ],
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/groups/{groupName}/kubepkgs/{name}/{channel}/revisions/{revisionID}":
      {
        get: {
          tags: ["kubepkg"],
          operationId: "GetKubepkgRevision",
          parameters: [
            {
              name: "Authorization",
              in: "header",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "groupName",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "name",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "channel",
              in: "path",
              required: true,
              schema: {
                $ref: "#/components/schemas/KubepkgChannel",
              },
            },
            {
              name: "revisionID",
              in: "path",
              required: true,
              schema: {
                $ref: "#/components/schemas/KubepkgRevisionId",
              },
            },
          ],
          responses: {
            "200": {
              description: "",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApisKubepkgV1Alpha1KubePkg",
                  },
                },
              },
            },
          },
        },
      },
    "/api/kubepkg-dashboard/v0/groups/{groupName}/kubepkgs/{name}/{channel}/versions":
      {
        get: {
          tags: ["kubepkg"],
          operationId: "ListKubepkgVersion",
          parameters: [
            {
              name: "Authorization",
              in: "header",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "groupName",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "name",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "channel",
              in: "path",
              required: true,
              schema: {
                $ref: "#/components/schemas/KubepkgChannel",
              },
            },
          ],
          responses: {
            "200": {
              description: "",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      allOf: [
                        {
                          $ref: "#/components/schemas/KubepkgVersionInfo",
                        },
                      ],
                      nullable: true,
                      "x-go-star-level": 1,
                    },
                  },
                },
              },
            },
          },
        },
        put: {
          tags: ["kubepkg"],
          operationId: "PutKubepkgVersion",
          parameters: [
            {
              name: "Authorization",
              in: "header",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "groupName",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "name",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "channel",
              in: "path",
              required: true,
              schema: {
                $ref: "#/components/schemas/KubepkgChannel",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    {
                      $ref: "#/components/schemas/KubepkgVersionInfo",
                    },
                  ],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "",
            },
          },
        },
      },
    "/api/kubepkg-dashboard/v0/groups/{groupName}/kubepkgs/{name}/{channel}/versions/{version}":
      {
        delete: {
          tags: ["kubepkg"],
          operationId: "DeleteKubepkgVersion",
          parameters: [
            {
              name: "Authorization",
              in: "header",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "groupName",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "name",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "channel",
              in: "path",
              required: true,
              schema: {
                $ref: "#/components/schemas/KubepkgChannel",
              },
            },
            {
              name: "version",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "",
            },
          },
        },
      },
    "/api/kubepkg-dashboard/v0/groups/{groupName}/robots": {
      get: {
        tags: ["group"],
        operationId: "ListGroupRobot",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "groupName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "accountID",
            in: "query",
            schema: {
              type: "array",
              items: {
                $ref: "#/components/schemas/AccountId",
              },
            },
          },
          {
            name: "identity",
            in: "query",
            schema: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          {
            name: "size",
            in: "query",
            schema: {
              type: "integer",
              format: "int64",
            },
          },
          {
            name: "offset",
            in: "query",
            schema: {
              type: "integer",
              format: "int64",
            },
          },
          {
            name: "roleType",
            in: "query",
            schema: {
              type: "array",
              items: {
                $ref: "#/components/schemas/GroupRoleType",
              },
            },
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/GroupRobotDataList",
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["group"],
        operationId: "CreateGroupRobot",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "groupName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                allOf: [
                  {
                    $ref: "#/components/schemas/AccountRobotInfo",
                  },
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AccountRobot",
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/groups/{groupName}/robots/{robotID}/tokens": {
      put: {
        tags: ["group"],
        operationId: "RefreshGroupRobotToken",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "groupName",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "robotID",
            in: "path",
            required: true,
            schema: {
              $ref: "#/components/schemas/AccountId",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                allOf: [
                  {
                    $ref: "#/components/schemas/GroupRefreshGroupRobotTokenData",
                  },
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthToken",
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/latest-kubepkgs": {
      get: {
        tags: ["kubepkg"],
        operationId: "LatestKubepkgs",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "names",
            in: "query",
            required: true,
            schema: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: {
                    allOf: [
                      {
                        $ref: "#/components/schemas/KubepkgVersionInfo",
                      },
                    ],
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                  propertyNames: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/user": {
      get: {
        tags: ["user"],
        operationId: "CurrentUser",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthOperatorAccount",
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/user/permissions": {
      get: {
        tags: ["user"],
        operationId: "CurrentPermissions",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RbacPermissions",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Account: {
        allOf: [
          {
            $ref: "#/components/schemas/DatatypesPrimaryId",
          },
          {
            $ref: "#/components/schemas/DatatypesCreationUpdationDeletionTime",
          },
          {
            type: "object",
            properties: {
              accountID: {
                allOf: [
                  {
                    $ref: "#/components/schemas/AccountId",
                  },
                ],
                "x-go-field-name": "AccountID",
              },
              accountType: {
                allOf: [
                  {
                    $ref: "#/components/schemas/AccountType",
                  },
                ],
                "x-go-field-name": "AccountType",
              },
            },
            additionalProperties: false,
            required: ["accountID", "accountType"],
          },
        ],
      },
      AccountId: {
        type: "string",
      },
      AccountRobot: {
        allOf: [
          {
            $ref: "#/components/schemas/Account",
          },
          {
            $ref: "#/components/schemas/AccountRobotInfo",
          },
          {
            type: "object",
            additionalProperties: false,
          },
        ],
      },
      AccountRobotInfo: {
        type: "object",
        properties: {
          name: {
            type: "string",
            "x-go-field-name": "Name",
          },
        },
        additionalProperties: false,
        required: ["name"],
      },
      AccountType: {
        type: "string",
        enum: ["USER", "ROBOT"],
        "x-enum-labels": ["USER", "ROBOT"],
      },
      AccountUser: {
        allOf: [
          {
            $ref: "#/components/schemas/Account",
          },
          {
            $ref: "#/components/schemas/AccountUserInfo",
          },
          {
            type: "object",
            additionalProperties: false,
          },
        ],
      },
      AccountUserDataList: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              allOf: [
                {
                  $ref: "#/components/schemas/AccountUser",
                },
              ],
              nullable: true,
              "x-go-star-level": 1,
            },
            "x-go-field-name": "Data",
          },
          total: {
            type: "integer",
            format: "int32",
            "x-go-field-name": "Total",
          },
        },
        additionalProperties: false,
        required: ["data", "total"],
      },
      AccountUserInfo: {
        type: "object",
        properties: {
          email: {
            type: "string",
            "x-go-field-name": "Email",
          },
          mobile: {
            type: "string",
            "x-go-field-name": "Mobile",
          },
          nickname: {
            type: "string",
            "x-go-field-name": "Nickname",
          },
        },
        additionalProperties: false,
      },
      ApiResourceQuantity: {
        type: "string",
      },
      ApisKubepkgV1Alpha1Container: {
        type: "object",
        properties: {
          args: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "Args",
          },
          command: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "Command",
          },
          env: {
            type: "object",
            additionalProperties: {
              $ref: "#/components/schemas/ApisKubepkgV1Alpha1EnvVarValueOrFrom",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "Env",
          },
          image: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1Image",
              },
            ],
            "x-go-field-name": "Image",
          },
          lifecycle: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1Lifecycle",
              },
            ],
            "x-go-field-name": "Lifecycle",
            nullable: true,
            "x-go-star-level": 1,
          },
          livenessProbe: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1Probe",
              },
            ],
            "x-go-field-name": "LivenessProbe",
            nullable: true,
            "x-go-star-level": 1,
          },
          ports: {
            type: "object",
            additionalProperties: {
              type: "integer",
              format: "int32",
            },
            propertyNames: {
              type: "string",
            },
            description: "Ports: [PortName]: ContainerPort",
            "x-go-field-name": "Ports",
          },
          readinessProbe: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1Probe",
              },
            ],
            "x-go-field-name": "ReadinessProbe",
            nullable: true,
            "x-go-star-level": 1,
          },
          resources: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1ResourceRequirements",
              },
            ],
            "x-go-field-name": "Resources",
            nullable: true,
            "x-go-star-level": 1,
          },
          securityContext: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1SecurityContext",
              },
            ],
            "x-go-field-name": "SecurityContext",
            nullable: true,
            "x-go-star-level": 1,
          },
          startupProbe: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1Probe",
              },
            ],
            "x-go-field-name": "StartupProbe",
            nullable: true,
            "x-go-star-level": 1,
          },
          stdin: {
            type: "boolean",
            "x-go-field-name": "Stdin",
          },
          stdinOnce: {
            type: "boolean",
            "x-go-field-name": "StdinOnce",
          },
          terminationMessagePath: {
            type: "string",
            "x-go-field-name": "TerminationMessagePath",
          },
          terminationMessagePolicy: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1TerminationMessagePolicy",
              },
            ],
            "x-go-field-name": "TerminationMessagePolicy",
          },
          tty: {
            type: "boolean",
            "x-go-field-name": "TTY",
          },
          workingDir: {
            type: "string",
            "x-go-field-name": "WorkingDir",
          },
        },
        additionalProperties: false,
        required: ["image"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.Container",
      },
      ApisKubepkgV1Alpha1Deploy: {
        type: "object",
        oneOf: [
          {
            type: "object",
            properties: {
              annotations: {
                type: "object",
                additionalProperties: {
                  type: "string",
                },
                propertyNames: {
                  type: "string",
                },
                "x-go-field-name": "Annotations",
              },
              kind: {
                type: "string",
                enum: ["ConfigMap"],
                "x-go-field-name": "Kind",
                "x-tag-validate": "@string{ConfigMap}",
              },
            },
            additionalProperties: false,
            required: ["kind"],
            "x-go-vendor-type":
              "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.DeployConfigMap",
          },
          {
            type: "object",
            properties: {
              annotations: {
                type: "object",
                additionalProperties: {
                  type: "string",
                },
                propertyNames: {
                  type: "string",
                },
                "x-go-field-name": "Annotations",
              },
              kind: {
                type: "string",
                enum: ["CronJob"],
                "x-go-field-name": "Kind",
                "x-tag-validate": "@string{CronJob}",
              },
              spec: {
                allOf: [
                  {
                    $ref: "#/components/schemas/K8SIoApiBatchV1CronJobSpec",
                  },
                ],
                "x-go-field-name": "Spec",
              },
            },
            additionalProperties: false,
            required: ["kind"],
            "x-go-vendor-type":
              "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.DeployCronJob",
          },
          {
            type: "object",
            properties: {
              annotations: {
                type: "object",
                additionalProperties: {
                  type: "string",
                },
                propertyNames: {
                  type: "string",
                },
                "x-go-field-name": "Annotations",
              },
              kind: {
                type: "string",
                enum: ["DaemonSet"],
                "x-go-field-name": "Kind",
                "x-tag-validate": "@string{DaemonSet}",
              },
              spec: {
                allOf: [
                  {
                    $ref: "#/components/schemas/K8SIoApiAppsV1DaemonSetSpec",
                  },
                ],
                "x-go-field-name": "Spec",
              },
            },
            additionalProperties: false,
            required: ["kind"],
            "x-go-vendor-type":
              "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.DeployDaemonSet",
          },
          {
            type: "object",
            properties: {
              annotations: {
                type: "object",
                additionalProperties: {
                  type: "string",
                },
                propertyNames: {
                  type: "string",
                },
                "x-go-field-name": "Annotations",
              },
              kind: {
                type: "string",
                enum: ["Deployment"],
                "x-go-field-name": "Kind",
                "x-tag-validate": "@string{Deployment}",
              },
              spec: {
                allOf: [
                  {
                    $ref: "#/components/schemas/K8SIoApiAppsV1DeploymentSpec",
                  },
                ],
                "x-go-field-name": "Spec",
              },
            },
            additionalProperties: false,
            required: ["kind"],
            "x-go-vendor-type":
              "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.DeployDeployment",
          },
          {
            type: "object",
            properties: {
              annotations: {
                type: "object",
                additionalProperties: {
                  type: "string",
                },
                propertyNames: {
                  type: "string",
                },
                "x-go-field-name": "Annotations",
              },
              kind: {
                type: "string",
                enum: ["Job"],
                "x-go-field-name": "Kind",
                "x-tag-validate": "@string{Job}",
              },
              spec: {
                allOf: [
                  {
                    $ref: "#/components/schemas/K8SIoApiBatchV1JobSpec",
                  },
                ],
                "x-go-field-name": "Spec",
              },
            },
            additionalProperties: false,
            required: ["kind"],
            "x-go-vendor-type":
              "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.DeployJob",
          },
          {
            type: "object",
            properties: {
              annotations: {
                type: "object",
                additionalProperties: {
                  type: "string",
                },
                propertyNames: {
                  type: "string",
                },
                "x-go-field-name": "Annotations",
              },
              kind: {
                type: "string",
                enum: ["Secret"],
                "x-go-field-name": "Kind",
                "x-tag-validate": "@string{Secret}",
              },
            },
            additionalProperties: false,
            required: ["kind"],
            "x-go-vendor-type":
              "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.DeploySecret",
          },
          {
            type: "object",
            properties: {
              annotations: {
                type: "object",
                additionalProperties: {
                  type: "string",
                },
                propertyNames: {
                  type: "string",
                },
                "x-go-field-name": "Annotations",
              },
              kind: {
                type: "string",
                enum: ["StatefulSet"],
                "x-go-field-name": "Kind",
                "x-tag-validate": "@string{StatefulSet}",
              },
              spec: {
                allOf: [
                  {
                    $ref: "#/components/schemas/K8SIoApiAppsV1StatefulSetSpec",
                  },
                ],
                "x-go-field-name": "Spec",
              },
            },
            additionalProperties: false,
            required: ["kind"],
            "x-go-vendor-type":
              "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.DeployStatefulSet",
          },
        ],
        discriminator: {
          propertyName: "kind",
        },
        required: ["kind"],
      },
      ApisKubepkgV1Alpha1DeployConfigMap: {
        type: "object",
        properties: {
          annotations: {
            type: "object",
            additionalProperties: {
              type: "string",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "Annotations",
          },
          kind: {
            type: "string",
            enum: ["ConfigMap"],
            "x-go-field-name": "Kind",
            "x-tag-validate": "@string{ConfigMap}",
          },
        },
        additionalProperties: false,
        required: ["kind"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.DeployConfigMap",
      },
      ApisKubepkgV1Alpha1DeployCronJob: {
        type: "object",
        properties: {
          annotations: {
            type: "object",
            additionalProperties: {
              type: "string",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "Annotations",
          },
          kind: {
            type: "string",
            enum: ["CronJob"],
            "x-go-field-name": "Kind",
            "x-tag-validate": "@string{CronJob}",
          },
          spec: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiBatchV1CronJobSpec",
              },
              {
                "x-go-field-name": "Spec",
              },
            ],
          },
        },
        additionalProperties: false,
        required: ["kind"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.DeployCronJob",
      },
      ApisKubepkgV1Alpha1DeployDaemonSet: {
        type: "object",
        properties: {
          annotations: {
            type: "object",
            additionalProperties: {
              type: "string",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "Annotations",
          },
          kind: {
            type: "string",
            enum: ["DaemonSet"],
            "x-go-field-name": "Kind",
            "x-tag-validate": "@string{DaemonSet}",
          },
          spec: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiAppsV1DaemonSetSpec",
              },
              {
                "x-go-field-name": "Spec",
              },
            ],
          },
        },
        additionalProperties: false,
        required: ["kind"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.DeployDaemonSet",
      },
      ApisKubepkgV1Alpha1DeployDeployment: {
        type: "object",
        properties: {
          annotations: {
            type: "object",
            additionalProperties: {
              type: "string",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "Annotations",
          },
          kind: {
            type: "string",
            enum: ["Deployment"],
            "x-go-field-name": "Kind",
            "x-tag-validate": "@string{Deployment}",
          },
          spec: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiAppsV1DeploymentSpec",
              },
              {
                "x-go-field-name": "Spec",
              },
            ],
          },
        },
        additionalProperties: false,
        required: ["kind"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.DeployDeployment",
      },
      ApisKubepkgV1Alpha1DeployJob: {
        type: "object",
        properties: {
          annotations: {
            type: "object",
            additionalProperties: {
              type: "string",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "Annotations",
          },
          kind: {
            type: "string",
            enum: ["Job"],
            "x-go-field-name": "Kind",
            "x-tag-validate": "@string{Job}",
          },
          spec: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiBatchV1JobSpec",
              },
              {
                "x-go-field-name": "Spec",
              },
            ],
          },
        },
        additionalProperties: false,
        required: ["kind"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.DeployJob",
      },
      ApisKubepkgV1Alpha1DeploySecret: {
        type: "object",
        properties: {
          annotations: {
            type: "object",
            additionalProperties: {
              type: "string",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "Annotations",
          },
          kind: {
            type: "string",
            enum: ["Secret"],
            "x-go-field-name": "Kind",
            "x-tag-validate": "@string{Secret}",
          },
        },
        additionalProperties: false,
        required: ["kind"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.DeploySecret",
      },
      ApisKubepkgV1Alpha1DeployStatefulSet: {
        type: "object",
        properties: {
          annotations: {
            type: "object",
            additionalProperties: {
              type: "string",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "Annotations",
          },
          kind: {
            type: "string",
            enum: ["StatefulSet"],
            "x-go-field-name": "Kind",
            "x-tag-validate": "@string{StatefulSet}",
          },
          spec: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiAppsV1StatefulSetSpec",
              },
              {
                "x-go-field-name": "Spec",
              },
            ],
          },
        },
        additionalProperties: false,
        required: ["kind"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.DeployStatefulSet",
      },
      ApisKubepkgV1Alpha1DigestMeta: {
        type: "object",
        properties: {
          digest: {
            type: "string",
            "x-go-field-name": "Digest",
          },
          name: {
            type: "string",
            "x-go-field-name": "Name",
          },
          platform: {
            type: "string",
            "x-go-field-name": "Platform",
          },
          size: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1FileSize",
              },
            ],
            "x-go-field-name": "Size",
          },
          tag: {
            type: "string",
            "x-go-field-name": "Tag",
          },
          type: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1DigestMetaType",
              },
            ],
            "x-go-field-name": "Type",
          },
        },
        additionalProperties: false,
        required: ["type", "digest", "name", "size"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.DigestMeta",
      },
      ApisKubepkgV1Alpha1DigestMetaType: {
        type: "string",
        enum: ["blob", "manifest"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.DigestMetaType",
      },
      ApisKubepkgV1Alpha1EnvVarValueOrFrom: {
        type: "string",
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.EnvVarValueOrFrom",
      },
      ApisKubepkgV1Alpha1Expose: {
        type: "object",
        properties: {
          gateway: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "Gateway",
          },
          type: {
            type: "string",
            description: "Type NodePort | Ingress",
            "x-go-field-name": "Type",
          },
        },
        additionalProperties: false,
        required: ["type"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.Expose",
      },
      ApisKubepkgV1Alpha1FileSize: {
        type: "integer",
        format: "int64",
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.FileSize",
      },
      ApisKubepkgV1Alpha1Image: {
        type: "object",
        properties: {
          digest: {
            type: "string",
            "x-go-field-name": "Digest",
          },
          name: {
            type: "string",
            "x-go-field-name": "Name",
          },
          platforms: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "Platforms",
          },
          pullPolicy: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PullPolicy",
              },
            ],
            "x-go-field-name": "PullPolicy",
          },
          tag: {
            type: "string",
            "x-go-field-name": "Tag",
          },
        },
        additionalProperties: false,
        required: ["name"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.Image",
      },
      ApisKubepkgV1Alpha1KubePkg: {
        allOf: [
          {
            $ref: "#/components/schemas/ApisMetaV1TypeMeta",
          },
          {
            type: "object",
            properties: {
              metadata: {
                allOf: [
                  {
                    $ref: "#/components/schemas/ApisMetaV1ObjectMeta",
                  },
                ],
                "x-go-field-name": "ObjectMeta",
              },
              spec: {
                allOf: [
                  {
                    $ref: "#/components/schemas/ApisKubepkgV1Alpha1Spec",
                  },
                ],
                "x-go-field-name": "Spec",
              },
              status: {
                allOf: [
                  {
                    $ref: "#/components/schemas/ApisKubepkgV1Alpha1Status",
                  },
                ],
                "x-go-field-name": "Status",
                nullable: true,
                "x-go-star-level": 1,
              },
            },
            additionalProperties: false,
            required: ["spec"],
          },
        ],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.KubePkg",
      },
      ApisKubepkgV1Alpha1KubePkgList: {
        allOf: [
          {
            $ref: "#/components/schemas/ApisMetaV1TypeMeta",
          },
          {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/ApisKubepkgV1Alpha1KubePkg",
                },
                "x-go-field-name": "Items",
              },
              metadata: {
                allOf: [
                  {
                    $ref: "#/components/schemas/ApisMetaV1ListMeta",
                  },
                ],
                "x-go-field-name": "ListMeta",
              },
            },
            additionalProperties: false,
            required: ["items"],
          },
        ],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.KubePkgList",
      },
      ApisKubepkgV1Alpha1Manifests: {
        type: "object",
        additionalProperties: {},
        propertyNames: {
          type: "string",
        },
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.Manifests",
      },
      ApisKubepkgV1Alpha1ScopeType: {
        type: "string",
        enum: ["Cluster", "Namespace"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.ScopeType",
      },
      ApisKubepkgV1Alpha1Service: {
        type: "object",
        properties: {
          clusterIP: {
            type: "string",
            "x-go-field-name": "ClusterIP",
          },
          expose: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1Expose",
              },
            ],
            "x-go-field-name": "Expose",
            nullable: true,
            "x-go-star-level": 1,
          },
          paths: {
            type: "object",
            additionalProperties: {
              type: "string",
            },
            propertyNames: {
              type: "string",
            },
            description: "Paths [PortName]BashPath",
            "x-go-field-name": "Paths",
          },
          ports: {
            type: "object",
            additionalProperties: {
              type: "integer",
              format: "int32",
            },
            propertyNames: {
              type: "string",
            },
            description: "Ports [PortName]servicePort",
            "x-go-field-name": "Ports",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.Service",
      },
      ApisKubepkgV1Alpha1ServiceAccount: {
        type: "object",
        properties: {
          rules: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiRbacV1PolicyRule",
            },
            "x-go-field-name": "Rules",
          },
          scope: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1ScopeType",
              },
            ],
            "x-go-field-name": "Scope",
          },
        },
        additionalProperties: false,
        required: ["rules"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.ServiceAccount",
      },
      ApisKubepkgV1Alpha1Spec: {
        type: "object",
        properties: {
          config: {
            type: "object",
            additionalProperties: {
              $ref: "#/components/schemas/ApisKubepkgV1Alpha1EnvVarValueOrFrom",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "Config",
          },
          containers: {
            type: "object",
            additionalProperties: {
              $ref: "#/components/schemas/ApisKubepkgV1Alpha1Container",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "Containers",
          },
          deploy: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1Deploy",
              },
            ],
            "x-go-field-name": "Deploy",
          },
          manifests: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1Manifests",
              },
            ],
            "x-go-field-name": "Manifests",
          },
          serviceAccount: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1ServiceAccount",
              },
            ],
            "x-go-field-name": "ServiceAccount",
            nullable: true,
            "x-go-star-level": 1,
          },
          services: {
            type: "object",
            additionalProperties: {
              $ref: "#/components/schemas/ApisKubepkgV1Alpha1Service",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "Services",
          },
          version: {
            type: "string",
            "x-go-field-name": "Version",
          },
          volumes: {
            type: "object",
            additionalProperties: {
              $ref: "#/components/schemas/ApisKubepkgV1Alpha1Volume",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "Volumes",
          },
        },
        additionalProperties: false,
        required: ["version"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.Spec",
      },
      ApisKubepkgV1Alpha1SpecData: {
        type: "object",
        properties: {
          data: {
            type: "object",
            additionalProperties: {
              type: "string",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "Data",
          },
        },
        additionalProperties: false,
        required: ["data"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.SpecData",
      },
      ApisKubepkgV1Alpha1Status: {
        type: "object",
        properties: {
          digests: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ApisKubepkgV1Alpha1DigestMeta",
            },
            "x-go-field-name": "Digests",
          },
          endpoint: {
            type: "object",
            additionalProperties: {
              type: "string",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "Endpoint",
          },
          images: {
            type: "object",
            additionalProperties: {
              type: "string",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "Images",
          },
          resources: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: {},
              propertyNames: {
                type: "string",
              },
            },
            "x-go-field-name": "Resources",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.Status",
      },
      ApisKubepkgV1Alpha1Volume: {
        type: "object",
        oneOf: [
          {
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1VolumeMount",
              },
              {
                type: "object",
                properties: {
                  opt: {
                    allOf: [
                      {
                        $ref: "#/components/schemas/K8SIoApiCoreV1ConfigMapVolumeSource",
                      },
                    ],
                    "x-go-field-name": "Opt",
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                  spec: {
                    allOf: [
                      {
                        $ref: "#/components/schemas/ApisKubepkgV1Alpha1SpecData",
                      },
                    ],
                    "x-go-field-name": "Spec",
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                  type: {
                    type: "string",
                    enum: ["ConfigMap"],
                    "x-go-field-name": "Type",
                    "x-tag-validate": "@string{ConfigMap}",
                  },
                },
                additionalProperties: false,
                required: ["type"],
              },
            ],
            "x-go-vendor-type":
              "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.VolumeConfigMap",
          },
          {
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1VolumeMount",
              },
              {
                type: "object",
                properties: {
                  opt: {
                    allOf: [
                      {
                        $ref: "#/components/schemas/K8SIoApiCoreV1EmptyDirVolumeSource",
                      },
                    ],
                    "x-go-field-name": "Opt",
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                  type: {
                    type: "string",
                    enum: ["EmptyDir"],
                    "x-go-field-name": "Type",
                    "x-tag-validate": "@string{EmptyDir}",
                  },
                },
                additionalProperties: false,
                required: ["type"],
              },
            ],
            "x-go-vendor-type":
              "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.VolumeEmptyDir",
          },
          {
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1VolumeMount",
              },
              {
                type: "object",
                properties: {
                  opt: {
                    allOf: [
                      {
                        $ref: "#/components/schemas/K8SIoApiCoreV1HostPathVolumeSource",
                      },
                    ],
                    "x-go-field-name": "Opt",
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                  type: {
                    type: "string",
                    enum: ["HostPath"],
                    "x-go-field-name": "Type",
                    "x-tag-validate": "@string{HostPath}",
                  },
                },
                additionalProperties: false,
                required: ["type"],
              },
            ],
            "x-go-vendor-type":
              "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.VolumeHostPath",
          },
          {
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1VolumeMount",
              },
              {
                type: "object",
                properties: {
                  opt: {
                    allOf: [
                      {
                        $ref: "#/components/schemas/K8SIoApiCoreV1PersistentVolumeClaimVolumeSource",
                      },
                    ],
                    "x-go-field-name": "Opt",
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                  spec: {
                    allOf: [
                      {
                        $ref: "#/components/schemas/K8SIoApiCoreV1PersistentVolumeClaimSpec",
                      },
                    ],
                    "x-go-field-name": "Spec",
                  },
                  type: {
                    type: "string",
                    enum: ["PersistentVolumeClaim"],
                    "x-go-field-name": "Type",
                    "x-tag-validate": "@string{PersistentVolumeClaim}",
                  },
                },
                additionalProperties: false,
                required: ["type", "spec"],
              },
            ],
            "x-go-vendor-type":
              "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.VolumePersistentVolumeClaim",
          },
          {
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1VolumeMount",
              },
              {
                type: "object",
                properties: {
                  opt: {
                    allOf: [
                      {
                        $ref: "#/components/schemas/K8SIoApiCoreV1SecretVolumeSource",
                      },
                    ],
                    "x-go-field-name": "Opt",
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                  spec: {
                    allOf: [
                      {
                        $ref: "#/components/schemas/ApisKubepkgV1Alpha1SpecData",
                      },
                    ],
                    "x-go-field-name": "Spec",
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                  type: {
                    type: "string",
                    enum: ["Secret"],
                    "x-go-field-name": "Type",
                    "x-tag-validate": "@string{Secret}",
                  },
                },
                additionalProperties: false,
                required: ["type"],
              },
            ],
            "x-go-vendor-type":
              "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.VolumeSecret",
          },
        ],
        discriminator: {
          propertyName: "type",
        },
        required: ["type"],
      },
      ApisKubepkgV1Alpha1VolumeConfigMap: {
        allOf: [
          {
            $ref: "#/components/schemas/ApisKubepkgV1Alpha1VolumeMount",
          },
          {
            type: "object",
            properties: {
              opt: {
                allOf: [
                  {
                    $ref: "#/components/schemas/K8SIoApiCoreV1ConfigMapVolumeSource",
                  },
                  {
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                ],
                "x-go-field-name": "Opt",
              },
              spec: {
                allOf: [
                  {
                    $ref: "#/components/schemas/ApisKubepkgV1Alpha1SpecData",
                  },
                  {
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                ],
                "x-go-field-name": "Spec",
              },
              type: {
                type: "string",
                enum: ["ConfigMap"],
                "x-go-field-name": "Type",
                "x-tag-validate": "@string{ConfigMap}",
              },
            },
            additionalProperties: false,
            required: ["type"],
          },
        ],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.VolumeConfigMap",
      },
      ApisKubepkgV1Alpha1VolumeEmptyDir: {
        allOf: [
          {
            $ref: "#/components/schemas/ApisKubepkgV1Alpha1VolumeMount",
          },
          {
            type: "object",
            properties: {
              opt: {
                allOf: [
                  {
                    $ref: "#/components/schemas/K8SIoApiCoreV1EmptyDirVolumeSource",
                  },
                  {
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                ],
                "x-go-field-name": "Opt",
              },
              type: {
                type: "string",
                enum: ["EmptyDir"],
                "x-go-field-name": "Type",
                "x-tag-validate": "@string{EmptyDir}",
              },
            },
            additionalProperties: false,
            required: ["type"],
          },
        ],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.VolumeEmptyDir",
      },
      ApisKubepkgV1Alpha1VolumeHostPath: {
        allOf: [
          {
            $ref: "#/components/schemas/ApisKubepkgV1Alpha1VolumeMount",
          },
          {
            type: "object",
            properties: {
              opt: {
                allOf: [
                  {
                    $ref: "#/components/schemas/K8SIoApiCoreV1HostPathVolumeSource",
                  },
                  {
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                ],
                "x-go-field-name": "Opt",
              },
              type: {
                type: "string",
                enum: ["HostPath"],
                "x-go-field-name": "Type",
                "x-tag-validate": "@string{HostPath}",
              },
            },
            additionalProperties: false,
            required: ["type"],
          },
        ],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.VolumeHostPath",
      },
      ApisKubepkgV1Alpha1VolumeMount: {
        type: "object",
        properties: {
          mountPath: {
            type: "string",
            "x-go-field-name": "MountPath",
          },
          optional: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "Optional",
            "x-go-star-level": 1,
          },
          prefix: {
            type: "string",
            description: "Prefix mountPath == export, use as envFrom",
            "x-go-field-name": "Prefix",
          },
          readOnly: {
            type: "boolean",
            description: "else volumeMounts",
            "x-go-field-name": "ReadOnly",
          },
          subPath: {
            type: "string",
            "x-go-field-name": "SubPath",
          },
        },
        additionalProperties: false,
        required: ["mountPath"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.VolumeMount",
      },
      ApisKubepkgV1Alpha1VolumePersistentVolumeClaim: {
        allOf: [
          {
            $ref: "#/components/schemas/ApisKubepkgV1Alpha1VolumeMount",
          },
          {
            type: "object",
            properties: {
              opt: {
                allOf: [
                  {
                    $ref: "#/components/schemas/K8SIoApiCoreV1PersistentVolumeClaimVolumeSource",
                  },
                  {
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                ],
                "x-go-field-name": "Opt",
              },
              spec: {
                allOf: [
                  {
                    $ref: "#/components/schemas/K8SIoApiCoreV1PersistentVolumeClaimSpec",
                  },
                  {
                    "x-go-field-name": "Spec",
                  },
                ],
              },
              type: {
                type: "string",
                enum: ["PersistentVolumeClaim"],
                "x-go-field-name": "Type",
                "x-tag-validate": "@string{PersistentVolumeClaim}",
              },
            },
            additionalProperties: false,
            required: ["type", "spec"],
          },
        ],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.VolumePersistentVolumeClaim",
      },
      ApisKubepkgV1Alpha1VolumeSecret: {
        allOf: [
          {
            $ref: "#/components/schemas/ApisKubepkgV1Alpha1VolumeMount",
          },
          {
            type: "object",
            properties: {
              opt: {
                allOf: [
                  {
                    $ref: "#/components/schemas/K8SIoApiCoreV1SecretVolumeSource",
                  },
                  {
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                ],
                "x-go-field-name": "Opt",
              },
              spec: {
                allOf: [
                  {
                    $ref: "#/components/schemas/ApisKubepkgV1Alpha1SpecData",
                  },
                  {
                    nullable: true,
                    "x-go-star-level": 1,
                  },
                ],
                "x-go-field-name": "Spec",
              },
              type: {
                type: "string",
                enum: ["Secret"],
                "x-go-field-name": "Type",
                "x-tag-validate": "@string{Secret}",
              },
            },
            additionalProperties: false,
            required: ["type"],
          },
        ],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.VolumeSecret",
      },
      ApisMetaV1LabelSelector: {
        type: "object",
        properties: {
          matchExpressions: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ApisMetaV1LabelSelectorRequirement",
            },
            "x-go-field-name": "MatchExpressions",
          },
          matchLabels: {
            type: "object",
            additionalProperties: {
              type: "string",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "MatchLabels",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type":
          "k8s.io/apimachinery/pkg/apis/meta/v1.LabelSelector",
      },
      ApisMetaV1LabelSelectorOperator: {
        type: "string",
        "x-go-vendor-type":
          "k8s.io/apimachinery/pkg/apis/meta/v1.LabelSelectorOperator",
      },
      ApisMetaV1LabelSelectorRequirement: {
        type: "object",
        properties: {
          key: {
            type: "string",
            "x-go-field-name": "Key",
          },
          operator: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisMetaV1LabelSelectorOperator",
              },
            ],
            description:
              "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
            "x-go-field-name": "Operator",
          },
          values: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "Values",
          },
        },
        additionalProperties: false,
        required: ["key", "operator"],
        "x-go-vendor-type":
          "k8s.io/apimachinery/pkg/apis/meta/v1.LabelSelectorRequirement",
      },
      ApisMetaV1ListMeta: {
        type: "object",
        properties: {
          continue: {
            type: "string",
            "x-go-field-name": "Continue",
          },
          remainingItemCount: {
            type: "integer",
            format: "int64",
            nullable: true,
            "x-go-field-name": "RemainingItemCount",
            "x-go-star-level": 1,
          },
          resourceVersion: {
            type: "string",
            "x-go-field-name": "ResourceVersion",
          },
          selfLink: {
            type: "string",
            "x-go-field-name": "SelfLink",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/apimachinery/pkg/apis/meta/v1.ListMeta",
      },
      ApisMetaV1ObjectMeta: {
        type: "object",
        properties: {
          annotations: {
            type: "object",
            additionalProperties: {
              type: "string",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "Annotations",
          },
          labels: {
            type: "object",
            additionalProperties: {
              type: "string",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "Labels",
          },
          name: {
            type: "string",
            "x-go-field-name": "Name",
          },
          namespace: {
            type: "string",
            "x-go-field-name": "Namespace",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta",
      },
      ApisMetaV1Time: {
        type: "string",
        format: "date-time",
      },
      ApisMetaV1TypeMeta: {
        type: "object",
        properties: {
          apiVersion: {
            type: "string",
            "x-go-field-name": "APIVersion",
          },
          kind: {
            type: "string",
            "x-go-field-name": "Kind",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/apimachinery/pkg/apis/meta/v1.TypeMeta",
      },
      AuthExchangeTokenData: {
        type: "object",
        properties: {
          code: {
            type: "string",
            "x-go-field-name": "Code",
          },
        },
        additionalProperties: false,
        required: ["code"],
      },
      AuthOperatorAccount: {
        allOf: [
          {
            $ref: "#/components/schemas/AccountUser",
          },
          {
            type: "object",
            properties: {
              accountType: {
                allOf: [
                  {
                    $ref: "#/components/schemas/AccountType",
                  },
                ],
                "x-go-field-name": "AccountType",
              },
              adminRole: {
                allOf: [
                  {
                    $ref: "#/components/schemas/GroupRoleType",
                  },
                ],
                "x-go-field-name": "AdminRole",
              },
              groupRoles: {
                type: "object",
                additionalProperties: {
                  $ref: "#/components/schemas/GroupRoleType",
                },
                propertyNames: {
                  $ref: "#/components/schemas/GroupId",
                },
                "x-go-field-name": "GroupRoles",
              },
            },
            additionalProperties: false,
            required: ["accountType", "adminRole"],
          },
        ],
      },
      AuthProviderInfo: {
        type: "object",
        properties: {
          name: {
            type: "string",
            "x-go-field-name": "Name",
          },
          type: {
            type: "string",
            "x-go-field-name": "Type",
          },
        },
        additionalProperties: false,
        required: ["type", "name"],
        "x-go-vendor-type": "github.com/octohelm/kubepkg/pkg/auth.ProviderInfo",
      },
      AuthToken: {
        type: "object",
        properties: {
          accessToken: {
            type: "string",
            "x-go-field-name": "AccessToken",
          },
          id: {
            type: "string",
            description: "AccountID",
            "x-go-field-name": "ID",
          },
          refreshToken: {
            type: "string",
            "x-go-field-name": "RefreshToken",
          },
          type: {
            type: "string",
            "x-go-field-name": "Type",
          },
        },
        additionalProperties: false,
        required: ["type", "accessToken"],
        "x-go-vendor-type": "github.com/octohelm/kubepkg/pkg/auth.Token",
      },
      Cluster: {
        allOf: [
          {
            $ref: "#/components/schemas/ClusterInfo",
          },
          {
            $ref: "#/components/schemas/DatatypesCreationUpdationDeletionTime",
          },
          {
            type: "object",
            properties: {
              clusterID: {
                allOf: [
                  {
                    $ref: "#/components/schemas/ClusterId",
                  },
                ],
                description: "集群 ID",
                "x-go-field-name": "ID",
              },
              name: {
                type: "string",
                description: "集群名称",
                "x-go-field-name": "Name",
              },
            },
            additionalProperties: false,
            required: ["clusterID", "name"],
          },
        ],
      },
      ClusterEnvType: {
        type: "string",
        enum: ["DEV", "ONLINE"],
        "x-enum-labels": ["开发集群", "生产集群"],
      },
      ClusterId: {
        type: "string",
      },
      ClusterInfo: {
        type: "object",
        properties: {
          desc: {
            type: "string",
            description: "集群描述",
            "x-go-field-name": "Desc",
          },
          endpoint: {
            type: "string",
            description:
              "Agent 地址\nvalidate: when('netType',is('DIRECT'),then(string(required())))",
            "x-go-field-name": "Endpoint",
          },
          envType: {
            allOf: [
              {
                $ref: "#/components/schemas/ClusterEnvType",
              },
            ],
            description: "集群环境类型",
            "x-go-field-name": "EnvType",
          },
          netType: {
            allOf: [
              {
                $ref: "#/components/schemas/ClusterNetType",
              },
            ],
            description:
              "网络环境\nvalidate: string(required(),oneOf(['DIRECT','AIRGAP']))",
            "x-go-field-name": "NetType",
          },
        },
        additionalProperties: false,
        required: ["envType", "netType"],
      },
      ClusterInstanceStatus: {
        type: "object",
        properties: {
          id: {
            type: "string",
            "x-go-field-name": "ID",
          },
          ping: {
            allOf: [
              {
                $ref: "#/components/schemas/StrfmtDuration",
              },
            ],
            "x-go-field-name": "Ping",
          },
          supportedPlatforms: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "SupportedPlatforms",
          },
        },
        additionalProperties: false,
        required: ["id"],
      },
      ClusterNetType: {
        type: "string",
        enum: ["DIRECT", "AIRGAP"],
        "x-enum-labels": ["可直连", "离线"],
      },
      DatatypesCreationTime: {
        type: "object",
        properties: {
          createdAt: {
            allOf: [
              {
                $ref: "#/components/schemas/DatatypesTimestamp",
              },
            ],
            "x-go-field-name": "CreatedAt",
          },
        },
        additionalProperties: false,
        required: ["createdAt"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/datatypes.CreationTime",
      },
      DatatypesCreationUpdationDeletionTime: {
        allOf: [
          {
            $ref: "#/components/schemas/DatatypesCreationUpdationTime",
          },
          {
            type: "object",
            properties: {
              deletedAt: {
                allOf: [
                  {
                    $ref: "#/components/schemas/DatatypesTimestamp",
                  },
                ],
                "x-go-field-name": "DeletedAt",
              },
            },
            additionalProperties: false,
          },
        ],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/datatypes.CreationUpdationDeletionTime",
      },
      DatatypesCreationUpdationTime: {
        allOf: [
          {
            $ref: "#/components/schemas/DatatypesCreationTime",
          },
          {
            type: "object",
            properties: {
              updatedAt: {
                allOf: [
                  {
                    $ref: "#/components/schemas/DatatypesTimestamp",
                  },
                ],
                "x-go-field-name": "UpdatedAt",
              },
            },
            additionalProperties: false,
            required: ["updatedAt"],
          },
        ],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/datatypes.CreationUpdationTime",
      },
      DatatypesPrimaryId: {
        type: "object",
        additionalProperties: false,
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/datatypes.PrimaryID",
      },
      DatatypesTimestamp: {
        type: "string",
        "x-go-vendor-type":
          "github.com/octohelm/storage/pkg/datatypes.Timestamp",
      },
      Group: {
        allOf: [
          {
            $ref: "#/components/schemas/GroupInfo",
          },
          {
            $ref: "#/components/schemas/DatatypesCreationUpdationDeletionTime",
          },
          {
            type: "object",
            properties: {
              groupID: {
                allOf: [
                  {
                    $ref: "#/components/schemas/GroupId",
                  },
                ],
                description: "组织 ID",
                "x-go-field-name": "ID",
              },
              name: {
                type: "string",
                description: "组织名称",
                "x-go-field-name": "Name",
              },
            },
            additionalProperties: false,
            required: ["groupID", "name"],
          },
        ],
      },
      GroupAccount: {
        allOf: [
          {
            $ref: "#/components/schemas/DatatypesCreationUpdationTime",
          },
          {
            type: "object",
            properties: {
              accountID: {
                allOf: [
                  {
                    $ref: "#/components/schemas/AccountId",
                  },
                ],
                description: "账户 ID",
                "x-go-field-name": "AccountID",
              },
              groupID: {
                allOf: [
                  {
                    $ref: "#/components/schemas/GroupId",
                  },
                ],
                description: "组织 ID",
                "x-go-field-name": "GroupID",
              },
              roleType: {
                allOf: [
                  {
                    $ref: "#/components/schemas/GroupRoleType",
                  },
                ],
                description: "角色",
                "x-go-field-name": "RoleType",
              },
            },
            additionalProperties: false,
            required: ["accountID", "groupID", "roleType"],
          },
        ],
      },
      GroupDeploymentId: {
        type: "string",
      },
      GroupEnv: {
        allOf: [
          {
            $ref: "#/components/schemas/GroupEnvInfo",
          },
          {
            $ref: "#/components/schemas/GroupEnvCluster",
          },
          {
            $ref: "#/components/schemas/DatatypesCreationUpdationDeletionTime",
          },
          {
            type: "object",
            properties: {
              envID: {
                allOf: [
                  {
                    $ref: "#/components/schemas/GroupEnvId",
                  },
                ],
                "x-go-field-name": "EnvID",
              },
              envName: {
                type: "string",
                "x-go-field-name": "EnvName",
              },
              groupID: {
                allOf: [
                  {
                    $ref: "#/components/schemas/GroupId",
                  },
                ],
                description: "组织 ID",
                "x-go-field-name": "GroupID",
              },
            },
            additionalProperties: false,
            required: ["envID", "groupID", "envName"],
          },
        ],
      },
      GroupEnvCluster: {
        type: "object",
        properties: {
          namespace: {
            type: "string",
            description: "对应 namespace\n<group>--<env-name>",
            "x-go-field-name": "Namespace",
          },
        },
        additionalProperties: false,
        required: ["namespace"],
      },
      GroupEnvId: {
        type: "string",
      },
      GroupEnvInfo: {
        type: "object",
        properties: {
          desc: {
            type: "string",
            description: "环境描述",
            "x-go-field-name": "Desc",
          },
          envType: {
            allOf: [
              {
                $ref: "#/components/schemas/GroupEnvType",
              },
            ],
            description: "环境类型",
            "x-go-field-name": "EnvType",
          },
        },
        additionalProperties: false,
        required: ["desc", "envType"],
      },
      GroupEnvType: {
        type: "string",
        enum: ["DEV", "ONLINE"],
        "x-enum-labels": ["开发环境", "线上环境"],
      },
      GroupEnvWithCluster: {
        allOf: [
          {
            $ref: "#/components/schemas/GroupEnv",
          },
          {
            type: "object",
            properties: {
              cluster: {
                allOf: [
                  {
                    $ref: "#/components/schemas/Cluster",
                  },
                ],
                "x-go-field-name": "Cluster",
                nullable: true,
                "x-go-star-level": 1,
              },
            },
            additionalProperties: false,
          },
        ],
      },
      GroupId: {
        type: "string",
      },
      GroupInfo: {
        type: "object",
        properties: {
          desc: {
            type: "string",
            description: "组织描述",
            "x-go-field-name": "Desc",
          },
          type: {
            allOf: [
              {
                $ref: "#/components/schemas/GroupType",
              },
            ],
            description: "组织类型",
            "x-go-field-name": "Type",
          },
        },
        additionalProperties: false,
        required: ["type"],
      },
      GroupRefreshGroupRobotTokenData: {
        allOf: [
          {
            $ref: "#/components/schemas/GroupRoleInfo",
          },
          {
            type: "object",
            properties: {
              expiresIn: {
                type: "integer",
                format: "int32",
                description: "秒",
                "x-go-field-name": "ExpiresIn",
              },
            },
            additionalProperties: false,
            required: ["expiresIn"],
          },
        ],
      },
      GroupRobot: {
        allOf: [
          {
            $ref: "#/components/schemas/GroupAccount",
          },
          {
            $ref: "#/components/schemas/AccountRobotInfo",
          },
          {
            type: "object",
            additionalProperties: false,
          },
        ],
      },
      GroupRobotDataList: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              allOf: [
                {
                  $ref: "#/components/schemas/GroupRobot",
                },
              ],
              nullable: true,
              "x-go-star-level": 1,
            },
            "x-go-field-name": "Data",
          },
          total: {
            type: "integer",
            format: "int32",
            "x-go-field-name": "Total",
          },
        },
        additionalProperties: false,
        required: ["data", "total"],
      },
      GroupRoleInfo: {
        type: "object",
        properties: {
          roleType: {
            allOf: [
              {
                $ref: "#/components/schemas/GroupRoleType",
              },
            ],
            "x-go-field-name": "RoleType",
          },
        },
        additionalProperties: false,
        required: ["roleType"],
      },
      GroupRoleType: {
        type: "string",
        enum: ["OWNER", "ADMIN", "MEMBER", "GUEST"],
        "x-enum-labels": ["拥有者", "管理员", "成员", "访问者"],
      },
      GroupType: {
        type: "string",
        enum: ["DEVELOP", "DEPLOYMENT"],
        "x-enum-labels": ["研发", "交付组"],
      },
      GroupUser: {
        allOf: [
          {
            $ref: "#/components/schemas/GroupAccount",
          },
          {
            $ref: "#/components/schemas/AccountUserInfo",
          },
          {
            type: "object",
            additionalProperties: false,
          },
        ],
      },
      GroupUserDataList: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              allOf: [
                {
                  $ref: "#/components/schemas/GroupUser",
                },
              ],
              nullable: true,
              "x-go-star-level": 1,
            },
            "x-go-field-name": "Data",
          },
          total: {
            type: "integer",
            format: "int32",
            "x-go-field-name": "Total",
          },
        },
        additionalProperties: false,
        required: ["data", "total"],
      },
      K8SIoApiAppsV1DaemonSetSpec: {
        type: "object",
        properties: {
          minReadySeconds: {
            type: "integer",
            format: "int32",
            "x-go-field-name": "MinReadySeconds",
          },
          revisionHistoryLimit: {
            type: "integer",
            format: "int32",
            nullable: true,
            "x-go-field-name": "RevisionHistoryLimit",
            "x-go-star-level": 1,
          },
          selector: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisMetaV1LabelSelector",
              },
            ],
            "x-go-field-name": "Selector",
            nullable: true,
            "x-go-star-level": 1,
          },
          template: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PodTemplateSpec",
              },
            ],
            description:
              "An object that describes the pod that will be created. The DaemonSet will create exactly one copy of this pod on every node that matches the template's node selector (or on every node if no node selector is specified). More info: https://kubernetes.io/docs/concepts/workloads/controllers/replicationcontroller#pod-template",
            "x-go-field-name": "Template",
          },
          updateStrategy: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiAppsV1DaemonSetUpdateStrategy",
              },
            ],
            description:
              "An update strategy to replace existing DaemonSet pods with new pods.",
            "x-go-field-name": "UpdateStrategy",
          },
        },
        additionalProperties: false,
        required: ["selector", "template"],
        "x-go-vendor-type": "k8s.io/api/apps/v1.DaemonSetSpec",
      },
      K8SIoApiAppsV1DaemonSetUpdateStrategy: {
        type: "object",
        properties: {
          rollingUpdate: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiAppsV1RollingUpdateDaemonSet",
              },
            ],
            "x-go-field-name": "RollingUpdate",
            nullable: true,
            "x-go-star-level": 1,
          },
          type: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiAppsV1DaemonSetUpdateStrategyType",
              },
            ],
            description:
              'Type of daemon set update. Can be "RollingUpdate" or "OnDelete". Default is RollingUpdate.',
            "x-go-field-name": "Type",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/apps/v1.DaemonSetUpdateStrategy",
      },
      K8SIoApiAppsV1DaemonSetUpdateStrategyType: {
        type: "string",
        enum: ["RollingUpdate", "OnDelete"],
        "x-go-vendor-type": "k8s.io/api/apps/v1.DaemonSetUpdateStrategyType",
      },
      K8SIoApiAppsV1DeploymentSpec: {
        type: "object",
        properties: {
          minReadySeconds: {
            type: "integer",
            format: "int32",
            "x-go-field-name": "MinReadySeconds",
          },
          paused: {
            type: "boolean",
            "x-go-field-name": "Paused",
          },
          progressDeadlineSeconds: {
            type: "integer",
            format: "int32",
            nullable: true,
            "x-go-field-name": "ProgressDeadlineSeconds",
            "x-go-star-level": 1,
          },
          replicas: {
            type: "integer",
            format: "int32",
            nullable: true,
            "x-go-field-name": "Replicas",
            "x-go-star-level": 1,
          },
          revisionHistoryLimit: {
            type: "integer",
            format: "int32",
            nullable: true,
            "x-go-field-name": "RevisionHistoryLimit",
            "x-go-star-level": 1,
          },
          selector: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisMetaV1LabelSelector",
              },
            ],
            "x-go-field-name": "Selector",
            nullable: true,
            "x-go-star-level": 1,
          },
          strategy: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiAppsV1DeploymentStrategy",
              },
            ],
            description:
              "The deployment strategy to use to replace existing pods with new ones.",
            "x-go-field-name": "Strategy",
          },
          template: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PodTemplateSpec",
              },
            ],
            description: "Template describes the pods that will be created.",
            "x-go-field-name": "Template",
          },
        },
        additionalProperties: false,
        required: ["selector", "template"],
        "x-go-vendor-type": "k8s.io/api/apps/v1.DeploymentSpec",
      },
      K8SIoApiAppsV1DeploymentStrategy: {
        type: "object",
        properties: {
          rollingUpdate: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiAppsV1RollingUpdateDeployment",
              },
            ],
            "x-go-field-name": "RollingUpdate",
            nullable: true,
            "x-go-star-level": 1,
          },
          type: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiAppsV1DeploymentStrategyType",
              },
            ],
            description:
              'Type of deployment. Can be "Recreate" or "RollingUpdate". Default is RollingUpdate.',
            "x-go-field-name": "Type",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/apps/v1.DeploymentStrategy",
      },
      K8SIoApiAppsV1DeploymentStrategyType: {
        type: "string",
        enum: ["Recreate", "RollingUpdate"],
        "x-go-vendor-type": "k8s.io/api/apps/v1.DeploymentStrategyType",
      },
      K8SIoApiAppsV1PersistentVolumeClaimRetentionPolicyType: {
        type: "string",
        "x-go-vendor-type":
          "k8s.io/api/apps/v1.PersistentVolumeClaimRetentionPolicyType",
      },
      K8SIoApiAppsV1PodManagementPolicyType: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/apps/v1.PodManagementPolicyType",
      },
      K8SIoApiAppsV1RollingUpdateDaemonSet: {
        type: "object",
        properties: {
          maxSurge: {
            allOf: [
              {
                $ref: "#/components/schemas/UtilIntstrIntOrString",
              },
            ],
            "x-go-field-name": "MaxSurge",
            nullable: true,
            "x-go-star-level": 1,
          },
          maxUnavailable: {
            allOf: [
              {
                $ref: "#/components/schemas/UtilIntstrIntOrString",
              },
            ],
            "x-go-field-name": "MaxUnavailable",
            nullable: true,
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/apps/v1.RollingUpdateDaemonSet",
      },
      K8SIoApiAppsV1RollingUpdateDeployment: {
        type: "object",
        properties: {
          maxSurge: {
            allOf: [
              {
                $ref: "#/components/schemas/UtilIntstrIntOrString",
              },
            ],
            "x-go-field-name": "MaxSurge",
            nullable: true,
            "x-go-star-level": 1,
          },
          maxUnavailable: {
            allOf: [
              {
                $ref: "#/components/schemas/UtilIntstrIntOrString",
              },
            ],
            "x-go-field-name": "MaxUnavailable",
            nullable: true,
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/apps/v1.RollingUpdateDeployment",
      },
      K8SIoApiAppsV1RollingUpdateStatefulSetStrategy: {
        type: "object",
        properties: {
          maxUnavailable: {
            allOf: [
              {
                $ref: "#/components/schemas/UtilIntstrIntOrString",
              },
            ],
            "x-go-field-name": "MaxUnavailable",
            nullable: true,
            "x-go-star-level": 1,
          },
          partition: {
            type: "integer",
            format: "int32",
            nullable: true,
            "x-go-field-name": "Partition",
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        "x-go-vendor-type":
          "k8s.io/api/apps/v1.RollingUpdateStatefulSetStrategy",
      },
      K8SIoApiAppsV1StatefulSetOrdinals: {
        type: "object",
        properties: {
          start: {
            type: "integer",
            format: "int32",
            "x-go-field-name": "Start",
          },
        },
        additionalProperties: false,
        required: ["start"],
        "x-go-vendor-type": "k8s.io/api/apps/v1.StatefulSetOrdinals",
      },
      K8SIoApiAppsV1StatefulSetPersistentVolumeClaimRetentionPolicy: {
        type: "object",
        properties: {
          whenDeleted: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiAppsV1PersistentVolumeClaimRetentionPolicyType",
              },
            ],
            description:
              "WhenDeleted specifies what happens to PVCs created from StatefulSet VolumeClaimTemplates when the StatefulSet is deleted. The default policy of `Retain` causes PVCs to not be affected by StatefulSet deletion. The `Delete` policy causes those PVCs to be deleted.",
            "x-go-field-name": "WhenDeleted",
          },
          whenScaled: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiAppsV1PersistentVolumeClaimRetentionPolicyType",
              },
            ],
            description:
              "WhenScaled specifies what happens to PVCs created from StatefulSet VolumeClaimTemplates when the StatefulSet is scaled down. The default policy of `Retain` causes PVCs to not be affected by a scaledown. The `Delete` policy causes the associated PVCs for any excess pods above the replica count to be deleted.",
            "x-go-field-name": "WhenScaled",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type":
          "k8s.io/api/apps/v1.StatefulSetPersistentVolumeClaimRetentionPolicy",
      },
      K8SIoApiAppsV1StatefulSetSpec: {
        type: "object",
        properties: {
          minReadySeconds: {
            type: "integer",
            format: "int32",
            "x-go-field-name": "MinReadySeconds",
          },
          ordinals: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiAppsV1StatefulSetOrdinals",
              },
            ],
            "x-go-field-name": "Ordinals",
            nullable: true,
            "x-go-star-level": 1,
          },
          persistentVolumeClaimRetentionPolicy: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiAppsV1StatefulSetPersistentVolumeClaimRetentionPolicy",
              },
            ],
            "x-go-field-name": "PersistentVolumeClaimRetentionPolicy",
            nullable: true,
            "x-go-star-level": 1,
          },
          podManagementPolicy: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiAppsV1PodManagementPolicyType",
              },
            ],
            description:
              "podManagementPolicy controls how pods are created during initial scale up, when replacing pods on nodes, or when scaling down. The default policy is `OrderedReady`, where pods are created in increasing order (pod-0, then pod-1, etc) and the controller will wait until each pod is ready before continuing. When scaling down, the pods are removed in the opposite order. The alternative policy is `Parallel` which will create pods in parallel to match the desired scale without waiting, and on scale down will delete all pods at once.",
            "x-go-field-name": "PodManagementPolicy",
          },
          replicas: {
            type: "integer",
            format: "int32",
            nullable: true,
            "x-go-field-name": "Replicas",
            "x-go-star-level": 1,
          },
          revisionHistoryLimit: {
            type: "integer",
            format: "int32",
            nullable: true,
            "x-go-field-name": "RevisionHistoryLimit",
            "x-go-star-level": 1,
          },
          selector: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisMetaV1LabelSelector",
              },
            ],
            "x-go-field-name": "Selector",
            nullable: true,
            "x-go-star-level": 1,
          },
          serviceName: {
            type: "string",
            "x-go-field-name": "ServiceName",
          },
          template: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PodTemplateSpec",
              },
            ],
            description:
              'template is the object that describes the pod that will be created if insufficient replicas are detected. Each pod stamped out by the StatefulSet will fulfill this Template, but have a unique identity from the rest of the StatefulSet. Each pod will be named with the format <statefulsetname>-<podindex>. For example, a pod in a StatefulSet named "web" with index number "3" would be named "web-3".',
            "x-go-field-name": "Template",
          },
          updateStrategy: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiAppsV1StatefulSetUpdateStrategy",
              },
            ],
            description:
              "updateStrategy indicates the StatefulSetUpdateStrategy that will be employed to update Pods in the StatefulSet when a revision is made to Template.",
            "x-go-field-name": "UpdateStrategy",
          },
          volumeClaimTemplates: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1PersistentVolumeClaim",
            },
            "x-go-field-name": "VolumeClaimTemplates",
          },
        },
        additionalProperties: false,
        required: ["selector", "template", "serviceName"],
        "x-go-vendor-type": "k8s.io/api/apps/v1.StatefulSetSpec",
      },
      K8SIoApiAppsV1StatefulSetUpdateStrategy: {
        type: "object",
        properties: {
          rollingUpdate: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiAppsV1RollingUpdateStatefulSetStrategy",
              },
            ],
            "x-go-field-name": "RollingUpdate",
            nullable: true,
            "x-go-star-level": 1,
          },
          type: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiAppsV1StatefulSetUpdateStrategyType",
              },
            ],
            description:
              "Type indicates the type of the StatefulSetUpdateStrategy. Default is RollingUpdate.",
            "x-go-field-name": "Type",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/apps/v1.StatefulSetUpdateStrategy",
      },
      K8SIoApiAppsV1StatefulSetUpdateStrategyType: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/apps/v1.StatefulSetUpdateStrategyType",
      },
      K8SIoApiBatchV1CompletionMode: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/batch/v1.CompletionMode",
      },
      K8SIoApiBatchV1ConcurrencyPolicy: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/batch/v1.ConcurrencyPolicy",
      },
      K8SIoApiBatchV1CronJobSpec: {
        type: "object",
        properties: {
          concurrencyPolicy: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiBatchV1ConcurrencyPolicy",
              },
            ],
            description:
              'Specifies how to treat concurrent executions of a Job. Valid values are: - "Allow" (default): allows CronJobs to run concurrently; - "Forbid": forbids concurrent runs, skipping next run if previous run hasn\'t finished yet; - "Replace": cancels currently running job and replaces it with a new one',
            "x-go-field-name": "ConcurrencyPolicy",
          },
          failedJobsHistoryLimit: {
            type: "integer",
            format: "int32",
            nullable: true,
            "x-go-field-name": "FailedJobsHistoryLimit",
            "x-go-star-level": 1,
          },
          jobTemplate: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiBatchV1JobTemplateSpec",
              },
            ],
            description:
              "Specifies the job that will be created when executing a CronJob.",
            "x-go-field-name": "JobTemplate",
          },
          schedule: {
            type: "string",
            "x-go-field-name": "Schedule",
          },
          startingDeadlineSeconds: {
            type: "integer",
            format: "int64",
            nullable: true,
            "x-go-field-name": "StartingDeadlineSeconds",
            "x-go-star-level": 1,
          },
          successfulJobsHistoryLimit: {
            type: "integer",
            format: "int32",
            nullable: true,
            "x-go-field-name": "SuccessfulJobsHistoryLimit",
            "x-go-star-level": 1,
          },
          suspend: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "Suspend",
            "x-go-star-level": 1,
          },
          timeZone: {
            type: "string",
            nullable: true,
            "x-go-field-name": "TimeZone",
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        required: ["schedule", "jobTemplate"],
        "x-go-vendor-type": "k8s.io/api/batch/v1.CronJobSpec",
      },
      K8SIoApiBatchV1JobSpec: {
        type: "object",
        properties: {
          activeDeadlineSeconds: {
            type: "integer",
            format: "int64",
            nullable: true,
            "x-go-field-name": "ActiveDeadlineSeconds",
            "x-go-star-level": 1,
          },
          backoffLimit: {
            type: "integer",
            format: "int32",
            nullable: true,
            "x-go-field-name": "BackoffLimit",
            "x-go-star-level": 1,
          },
          completionMode: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiBatchV1CompletionMode",
              },
            ],
            "x-go-field-name": "CompletionMode",
            nullable: true,
            "x-go-star-level": 1,
          },
          completions: {
            type: "integer",
            format: "int32",
            nullable: true,
            "x-go-field-name": "Completions",
            "x-go-star-level": 1,
          },
          manualSelector: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "ManualSelector",
            "x-go-star-level": 1,
          },
          parallelism: {
            type: "integer",
            format: "int32",
            nullable: true,
            "x-go-field-name": "Parallelism",
            "x-go-star-level": 1,
          },
          podFailurePolicy: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiBatchV1PodFailurePolicy",
              },
            ],
            "x-go-field-name": "PodFailurePolicy",
            nullable: true,
            "x-go-star-level": 1,
          },
          selector: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisMetaV1LabelSelector",
              },
            ],
            "x-go-field-name": "Selector",
            nullable: true,
            "x-go-star-level": 1,
          },
          suspend: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "Suspend",
            "x-go-star-level": 1,
          },
          template: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PodTemplateSpec",
              },
            ],
            description:
              "Describes the pod that will be created when executing a job. More info: https://kubernetes.io/docs/concepts/workloads/controllers/jobs-run-to-completion/",
            "x-go-field-name": "Template",
          },
          ttlSecondsAfterFinished: {
            type: "integer",
            format: "int32",
            nullable: true,
            "x-go-field-name": "TTLSecondsAfterFinished",
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        required: ["template"],
        "x-go-vendor-type": "k8s.io/api/batch/v1.JobSpec",
      },
      K8SIoApiBatchV1JobTemplateSpec: {
        type: "object",
        properties: {
          metadata: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisMetaV1ObjectMeta",
              },
            ],
            description:
              "Standard object's metadata of the jobs created from this template. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata",
            "x-go-field-name": "ObjectMeta",
          },
          spec: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiBatchV1JobSpec",
              },
            ],
            "x-go-field-name": "Spec",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/batch/v1.JobTemplateSpec",
      },
      K8SIoApiBatchV1PodFailurePolicy: {
        type: "object",
        properties: {
          rules: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiBatchV1PodFailurePolicyRule",
            },
            "x-go-field-name": "Rules",
          },
        },
        additionalProperties: false,
        required: ["rules"],
        "x-go-vendor-type": "k8s.io/api/batch/v1.PodFailurePolicy",
      },
      K8SIoApiBatchV1PodFailurePolicyAction: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/batch/v1.PodFailurePolicyAction",
      },
      K8SIoApiBatchV1PodFailurePolicyOnExitCodesOperator: {
        type: "string",
        "x-go-vendor-type":
          "k8s.io/api/batch/v1.PodFailurePolicyOnExitCodesOperator",
      },
      K8SIoApiBatchV1PodFailurePolicyOnExitCodesRequirement: {
        type: "object",
        properties: {
          containerName: {
            type: "string",
            "x-go-field-name": "ContainerName",
            "x-go-star-level": 1,
          },
          operator: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiBatchV1PodFailurePolicyOnExitCodesOperator",
              },
            ],
            description:
              "Represents the relationship between the container exit code(s) and the specified values. Containers completed with success (exit code 0) are excluded from the requirement check. Possible values are: - In: the requirement is satisfied if at least one container exit code\n  (might be multiple if there are multiple containers not restricted\n  by the 'containerName' field) is in the set of specified values.\n- NotIn: the requirement is satisfied if at least one container exit code\n  (might be multiple if there are multiple containers not restricted\n  by the 'containerName' field) is not in the set of specified values.\nAdditional values are considered to be added in the future. Clients should react to an unknown operator by assuming the requirement is not satisfied.",
            "x-go-field-name": "Operator",
          },
          values: {
            type: "array",
            items: {
              type: "integer",
              format: "int32",
            },
            "x-go-field-name": "Values",
          },
        },
        additionalProperties: false,
        required: ["containerName", "operator", "values"],
        "x-go-vendor-type":
          "k8s.io/api/batch/v1.PodFailurePolicyOnExitCodesRequirement",
      },
      K8SIoApiBatchV1PodFailurePolicyOnPodConditionsPattern: {
        type: "object",
        properties: {
          status: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1ConditionStatus",
              },
            ],
            description:
              "Specifies the required Pod condition status. To match a pod condition it is required that the specified status equals the pod condition status. Defaults to True.",
            "x-go-field-name": "Status",
          },
          type: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PodConditionType",
              },
            ],
            description:
              "Specifies the required Pod condition type. To match a pod condition it is required that specified type equals the pod condition type.",
            "x-go-field-name": "Type",
          },
        },
        additionalProperties: false,
        required: ["type", "status"],
        "x-go-vendor-type":
          "k8s.io/api/batch/v1.PodFailurePolicyOnPodConditionsPattern",
      },
      K8SIoApiBatchV1PodFailurePolicyRule: {
        type: "object",
        properties: {
          action: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiBatchV1PodFailurePolicyAction",
              },
            ],
            description:
              "Specifies the action taken on a pod failure when the requirements are satisfied. Possible values are: - FailJob: indicates that the pod's job is marked as Failed and all\n  running pods are terminated.\n- Ignore: indicates that the counter towards the .backoffLimit is not\n  incremented and a replacement pod is created.\n- Count: indicates that the pod is handled in the default way - the\n  counter towards the .backoffLimit is incremented.\nAdditional values are considered to be added in the future. Clients should react to an unknown action by skipping the rule.",
            "x-go-field-name": "Action",
          },
          onExitCodes: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiBatchV1PodFailurePolicyOnExitCodesRequirement",
              },
            ],
            "x-go-field-name": "OnExitCodes",
            nullable: true,
            "x-go-star-level": 1,
          },
          onPodConditions: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiBatchV1PodFailurePolicyOnPodConditionsPattern",
            },
            "x-go-field-name": "OnPodConditions",
          },
        },
        additionalProperties: false,
        required: ["action", "onExitCodes", "onPodConditions"],
        "x-go-vendor-type": "k8s.io/api/batch/v1.PodFailurePolicyRule",
      },
      K8SIoApiCoreV1Affinity: {
        type: "object",
        properties: {
          nodeAffinity: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1NodeAffinity",
              },
            ],
            "x-go-field-name": "NodeAffinity",
            nullable: true,
            "x-go-star-level": 1,
          },
          podAffinity: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PodAffinity",
              },
            ],
            "x-go-field-name": "PodAffinity",
            nullable: true,
            "x-go-star-level": 1,
          },
          podAntiAffinity: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PodAntiAffinity",
              },
            ],
            "x-go-field-name": "PodAntiAffinity",
            nullable: true,
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.Affinity",
      },
      K8SIoApiCoreV1Capabilities: {
        type: "object",
        properties: {
          add: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1Capability",
            },
            "x-go-field-name": "Add",
          },
          drop: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1Capability",
            },
            "x-go-field-name": "Drop",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.Capabilities",
      },
      K8SIoApiCoreV1Capability: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.Capability",
      },
      K8SIoApiCoreV1ClaimSource: {
        type: "object",
        properties: {
          resourceClaimName: {
            type: "string",
            nullable: true,
            "x-go-field-name": "ResourceClaimName",
            "x-go-star-level": 1,
          },
          resourceClaimTemplateName: {
            type: "string",
            nullable: true,
            "x-go-field-name": "ResourceClaimTemplateName",
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.ClaimSource",
      },
      K8SIoApiCoreV1ConditionStatus: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.ConditionStatus",
      },
      K8SIoApiCoreV1ConfigMapVolumeSource: {
        allOf: [
          {
            $ref: "#/components/schemas/K8SIoApiCoreV1LocalObjectReference",
          },
          {
            type: "object",
            properties: {
              defaultMode: {
                type: "integer",
                format: "int32",
                nullable: true,
                "x-go-field-name": "DefaultMode",
                "x-go-star-level": 1,
              },
              items: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/K8SIoApiCoreV1KeyToPath",
                },
                "x-go-field-name": "Items",
              },
              optional: {
                type: "boolean",
                nullable: true,
                "x-go-field-name": "Optional",
                "x-go-star-level": 1,
              },
            },
            additionalProperties: false,
          },
        ],
        "x-go-vendor-type": "k8s.io/api/core/v1.ConfigMapVolumeSource",
      },
      K8SIoApiCoreV1DnsPolicy: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.DNSPolicy",
      },
      K8SIoApiCoreV1EmptyDirVolumeSource: {
        type: "object",
        properties: {
          medium: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1StorageMedium",
              },
            ],
            description:
              'medium represents what type of storage medium should back this directory. The default is "" which means to use the node\'s default medium. Must be an empty string (default) or Memory. More info: https://kubernetes.io/docs/concepts/storage/volumes#emptydir',
            "x-go-field-name": "Medium",
          },
          sizeLimit: {
            allOf: [
              {
                $ref: "#/components/schemas/ApiResourceQuantity",
              },
            ],
            "x-go-field-name": "SizeLimit",
            nullable: true,
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.EmptyDirVolumeSource",
      },
      K8SIoApiCoreV1ExecAction: {
        type: "object",
        properties: {
          command: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "Command",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.ExecAction",
      },
      K8SIoApiCoreV1GrpcAction: {
        type: "object",
        properties: {
          port: {
            type: "integer",
            format: "int32",
            "x-go-field-name": "Port",
          },
          service: {
            type: "string",
            "x-go-field-name": "Service",
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        required: ["port", "service"],
        "x-go-vendor-type": "k8s.io/api/core/v1.GRPCAction",
      },
      K8SIoApiCoreV1HostAlias: {
        type: "object",
        properties: {
          hostnames: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "Hostnames",
          },
          ip: {
            type: "string",
            "x-go-field-name": "IP",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.HostAlias",
      },
      K8SIoApiCoreV1HostPathType: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.HostPathType",
      },
      K8SIoApiCoreV1HostPathVolumeSource: {
        type: "object",
        properties: {
          path: {
            type: "string",
            "x-go-field-name": "Path",
          },
          type: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1HostPathType",
              },
            ],
            "x-go-field-name": "Type",
            nullable: true,
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        required: ["path"],
        "x-go-vendor-type": "k8s.io/api/core/v1.HostPathVolumeSource",
      },
      K8SIoApiCoreV1HttpGetAction: {
        type: "object",
        properties: {
          host: {
            type: "string",
            "x-go-field-name": "Host",
          },
          httpHeaders: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1HttpHeader",
            },
            "x-go-field-name": "HTTPHeaders",
          },
          path: {
            type: "string",
            "x-go-field-name": "Path",
          },
          port: {
            allOf: [
              {
                $ref: "#/components/schemas/UtilIntstrIntOrString",
              },
            ],
            description:
              "Name or number of the port to access on the container. Number must be in the range 1 to 65535. Name must be an IANA_SVC_NAME.",
            "x-go-field-name": "Port",
          },
          scheme: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1UriScheme",
              },
            ],
            description:
              "Scheme to use for connecting to the host. Defaults to HTTP.",
            "x-go-field-name": "Scheme",
          },
        },
        additionalProperties: false,
        required: ["port"],
        "x-go-vendor-type": "k8s.io/api/core/v1.HTTPGetAction",
      },
      K8SIoApiCoreV1HttpHeader: {
        type: "object",
        properties: {
          name: {
            type: "string",
            "x-go-field-name": "Name",
          },
          value: {
            type: "string",
            "x-go-field-name": "Value",
          },
        },
        additionalProperties: false,
        required: ["name", "value"],
        "x-go-vendor-type": "k8s.io/api/core/v1.HTTPHeader",
      },
      K8SIoApiCoreV1KeyToPath: {
        type: "object",
        properties: {
          key: {
            type: "string",
            "x-go-field-name": "Key",
          },
          mode: {
            type: "integer",
            format: "int32",
            nullable: true,
            "x-go-field-name": "Mode",
            "x-go-star-level": 1,
          },
          path: {
            type: "string",
            "x-go-field-name": "Path",
          },
        },
        additionalProperties: false,
        required: ["key", "path"],
        "x-go-vendor-type": "k8s.io/api/core/v1.KeyToPath",
      },
      K8SIoApiCoreV1Lifecycle: {
        type: "object",
        properties: {
          postStart: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1LifecycleHandler",
              },
            ],
            "x-go-field-name": "PostStart",
            nullable: true,
            "x-go-star-level": 1,
          },
          preStop: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1LifecycleHandler",
              },
            ],
            "x-go-field-name": "PreStop",
            nullable: true,
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.Lifecycle",
      },
      K8SIoApiCoreV1LifecycleHandler: {
        type: "object",
        properties: {
          exec: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1ExecAction",
              },
            ],
            "x-go-field-name": "Exec",
            nullable: true,
            "x-go-star-level": 1,
          },
          httpGet: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1HttpGetAction",
              },
            ],
            "x-go-field-name": "HTTPGet",
            nullable: true,
            "x-go-star-level": 1,
          },
          tcpSocket: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1TcpSocketAction",
              },
            ],
            "x-go-field-name": "TCPSocket",
            nullable: true,
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.LifecycleHandler",
      },
      K8SIoApiCoreV1LocalObjectReference: {
        type: "object",
        properties: {
          name: {
            type: "string",
            "x-go-field-name": "Name",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.LocalObjectReference",
      },
      K8SIoApiCoreV1NodeAffinity: {
        type: "object",
        properties: {
          preferredDuringSchedulingIgnoredDuringExecution: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1PreferredSchedulingTerm",
            },
            "x-go-field-name":
              "PreferredDuringSchedulingIgnoredDuringExecution",
          },
          requiredDuringSchedulingIgnoredDuringExecution: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1NodeSelector",
              },
            ],
            "x-go-field-name": "RequiredDuringSchedulingIgnoredDuringExecution",
            nullable: true,
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.NodeAffinity",
      },
      K8SIoApiCoreV1NodeInclusionPolicy: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.NodeInclusionPolicy",
      },
      K8SIoApiCoreV1NodeSelector: {
        type: "object",
        properties: {
          nodeSelectorTerms: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1NodeSelectorTerm",
            },
            "x-go-field-name": "NodeSelectorTerms",
          },
        },
        additionalProperties: false,
        required: ["nodeSelectorTerms"],
        "x-go-vendor-type": "k8s.io/api/core/v1.NodeSelector",
      },
      K8SIoApiCoreV1NodeSelectorOperator: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.NodeSelectorOperator",
      },
      K8SIoApiCoreV1NodeSelectorRequirement: {
        type: "object",
        properties: {
          key: {
            type: "string",
            "x-go-field-name": "Key",
          },
          operator: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1NodeSelectorOperator",
              },
            ],
            description:
              "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
            "x-go-field-name": "Operator",
          },
          values: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "Values",
          },
        },
        additionalProperties: false,
        required: ["key", "operator"],
        "x-go-vendor-type": "k8s.io/api/core/v1.NodeSelectorRequirement",
      },
      K8SIoApiCoreV1NodeSelectorTerm: {
        type: "object",
        properties: {
          matchExpressions: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1NodeSelectorRequirement",
            },
            "x-go-field-name": "MatchExpressions",
          },
          matchFields: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1NodeSelectorRequirement",
            },
            "x-go-field-name": "MatchFields",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.NodeSelectorTerm",
      },
      K8SIoApiCoreV1OsName: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.OSName",
      },
      K8SIoApiCoreV1PersistentVolumeAccessMode: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.PersistentVolumeAccessMode",
      },
      K8SIoApiCoreV1PersistentVolumeClaim: {
        allOf: [
          {
            $ref: "#/components/schemas/ApisMetaV1TypeMeta",
          },
          {
            type: "object",
            properties: {
              metadata: {
                allOf: [
                  {
                    $ref: "#/components/schemas/ApisMetaV1ObjectMeta",
                  },
                ],
                description:
                  "Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata",
                "x-go-field-name": "ObjectMeta",
              },
              spec: {
                allOf: [
                  {
                    $ref: "#/components/schemas/K8SIoApiCoreV1PersistentVolumeClaimSpec",
                  },
                ],
                "x-go-field-name": "Spec",
              },
              status: {
                allOf: [
                  {
                    $ref: "#/components/schemas/K8SIoApiCoreV1PersistentVolumeClaimStatus",
                  },
                ],
                description:
                  "status represents the current information/status of a persistent volume claim. Read-only. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#persistentvolumeclaims",
                "x-go-field-name": "Status",
              },
            },
            additionalProperties: false,
          },
        ],
        "x-go-vendor-type": "k8s.io/api/core/v1.PersistentVolumeClaim",
      },
      K8SIoApiCoreV1PersistentVolumeClaimCondition: {
        type: "object",
        properties: {
          lastProbeTime: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisMetaV1Time",
              },
            ],
            description: "lastProbeTime is the time we probed the condition.",
            "x-go-field-name": "LastProbeTime",
          },
          lastTransitionTime: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisMetaV1Time",
              },
            ],
            description:
              "lastTransitionTime is the time the condition transitioned from one status to another.",
            "x-go-field-name": "LastTransitionTime",
          },
          message: {
            type: "string",
            "x-go-field-name": "Message",
          },
          reason: {
            type: "string",
            "x-go-field-name": "Reason",
          },
          status: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1ConditionStatus",
              },
            ],
            "x-go-field-name": "Status",
          },
          type: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PersistentVolumeClaimConditionType",
              },
            ],
            "x-go-field-name": "Type",
          },
        },
        additionalProperties: false,
        required: ["type", "status"],
        "x-go-vendor-type": "k8s.io/api/core/v1.PersistentVolumeClaimCondition",
      },
      K8SIoApiCoreV1PersistentVolumeClaimConditionType: {
        type: "string",
        "x-go-vendor-type":
          "k8s.io/api/core/v1.PersistentVolumeClaimConditionType",
      },
      K8SIoApiCoreV1PersistentVolumeClaimPhase: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.PersistentVolumeClaimPhase",
      },
      K8SIoApiCoreV1PersistentVolumeClaimResizeStatus: {
        type: "string",
        "x-go-vendor-type":
          "k8s.io/api/core/v1.PersistentVolumeClaimResizeStatus",
      },
      K8SIoApiCoreV1PersistentVolumeClaimSpec: {
        type: "object",
        properties: {
          accessModes: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1PersistentVolumeAccessMode",
            },
            "x-go-field-name": "AccessModes",
          },
          dataSource: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1TypedLocalObjectReference",
              },
            ],
            "x-go-field-name": "DataSource",
            nullable: true,
            "x-go-star-level": 1,
          },
          dataSourceRef: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1TypedObjectReference",
              },
            ],
            "x-go-field-name": "DataSourceRef",
            nullable: true,
            "x-go-star-level": 1,
          },
          resources: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1ResourceRequirements",
              },
            ],
            description:
              "resources represents the minimum resources the volume should have. If RecoverVolumeExpansionFailure feature is enabled users are allowed to specify resource requirements that are lower than previous value but must still be higher than capacity recorded in the status field of the claim. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#resources",
            "x-go-field-name": "Resources",
          },
          selector: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisMetaV1LabelSelector",
              },
            ],
            "x-go-field-name": "Selector",
            nullable: true,
            "x-go-star-level": 1,
          },
          storageClassName: {
            type: "string",
            nullable: true,
            "x-go-field-name": "StorageClassName",
            "x-go-star-level": 1,
          },
          volumeMode: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PersistentVolumeMode",
              },
            ],
            "x-go-field-name": "VolumeMode",
            nullable: true,
            "x-go-star-level": 1,
          },
          volumeName: {
            type: "string",
            "x-go-field-name": "VolumeName",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.PersistentVolumeClaimSpec",
      },
      K8SIoApiCoreV1PersistentVolumeClaimStatus: {
        type: "object",
        properties: {
          accessModes: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1PersistentVolumeAccessMode",
            },
            "x-go-field-name": "AccessModes",
          },
          allocatedResources: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1ResourceList",
              },
            ],
            description:
              "allocatedResources is the storage resource within AllocatedResources tracks the capacity allocated to a PVC. It may be larger than the actual capacity when a volume expansion operation is requested. For storage quota, the larger value from allocatedResources and PVC.spec.resources is used. If allocatedResources is not set, PVC.spec.resources alone is used for quota calculation. If a volume expansion capacity request is lowered, allocatedResources is only lowered if there are no expansion operations in progress and if the actual volume capacity is equal or lower than the requested capacity. This is an alpha field and requires enabling RecoverVolumeExpansionFailure feature.",
            "x-go-field-name": "AllocatedResources",
          },
          capacity: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1ResourceList",
              },
            ],
            description:
              "capacity represents the actual resources of the underlying volume.",
            "x-go-field-name": "Capacity",
          },
          conditions: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1PersistentVolumeClaimCondition",
            },
            "x-go-field-name": "Conditions",
          },
          phase: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PersistentVolumeClaimPhase",
              },
            ],
            description:
              "phase represents the current phase of PersistentVolumeClaim.",
            "x-go-field-name": "Phase",
          },
          resizeStatus: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PersistentVolumeClaimResizeStatus",
              },
            ],
            "x-go-field-name": "ResizeStatus",
            nullable: true,
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.PersistentVolumeClaimStatus",
      },
      K8SIoApiCoreV1PersistentVolumeClaimVolumeSource: {
        type: "object",
        properties: {
          claimName: {
            type: "string",
            "x-go-field-name": "ClaimName",
          },
          readOnly: {
            type: "boolean",
            description: "else volumeMounts",
            "x-go-field-name": "ReadOnly",
          },
        },
        additionalProperties: false,
        required: ["claimName"],
        "x-go-vendor-type":
          "k8s.io/api/core/v1.PersistentVolumeClaimVolumeSource",
      },
      K8SIoApiCoreV1PersistentVolumeMode: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.PersistentVolumeMode",
      },
      K8SIoApiCoreV1PodAffinity: {
        type: "object",
        properties: {
          preferredDuringSchedulingIgnoredDuringExecution: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1WeightedPodAffinityTerm",
            },
            "x-go-field-name":
              "PreferredDuringSchedulingIgnoredDuringExecution",
          },
          requiredDuringSchedulingIgnoredDuringExecution: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1PodAffinityTerm",
            },
            "x-go-field-name": "RequiredDuringSchedulingIgnoredDuringExecution",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.PodAffinity",
      },
      K8SIoApiCoreV1PodAffinityTerm: {
        type: "object",
        properties: {
          labelSelector: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisMetaV1LabelSelector",
              },
            ],
            "x-go-field-name": "LabelSelector",
            nullable: true,
            "x-go-star-level": 1,
          },
          namespaceSelector: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisMetaV1LabelSelector",
              },
            ],
            "x-go-field-name": "NamespaceSelector",
            nullable: true,
            "x-go-star-level": 1,
          },
          namespaces: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "Namespaces",
          },
          topologyKey: {
            type: "string",
            "x-go-field-name": "TopologyKey",
          },
        },
        additionalProperties: false,
        required: ["topologyKey"],
        "x-go-vendor-type": "k8s.io/api/core/v1.PodAffinityTerm",
      },
      K8SIoApiCoreV1PodAntiAffinity: {
        type: "object",
        properties: {
          preferredDuringSchedulingIgnoredDuringExecution: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1WeightedPodAffinityTerm",
            },
            "x-go-field-name":
              "PreferredDuringSchedulingIgnoredDuringExecution",
          },
          requiredDuringSchedulingIgnoredDuringExecution: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1PodAffinityTerm",
            },
            "x-go-field-name": "RequiredDuringSchedulingIgnoredDuringExecution",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.PodAntiAffinity",
      },
      K8SIoApiCoreV1PodConditionType: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.PodConditionType",
      },
      K8SIoApiCoreV1PodDnsConfig: {
        type: "object",
        properties: {
          nameservers: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "Nameservers",
          },
          options: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1PodDnsConfigOption",
            },
            "x-go-field-name": "Options",
          },
          searches: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "Searches",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.PodDNSConfig",
      },
      K8SIoApiCoreV1PodDnsConfigOption: {
        type: "object",
        properties: {
          name: {
            type: "string",
            "x-go-field-name": "Name",
          },
          value: {
            type: "string",
            nullable: true,
            "x-go-field-name": "Value",
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.PodDNSConfigOption",
      },
      K8SIoApiCoreV1PodFsGroupChangePolicy: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.PodFSGroupChangePolicy",
      },
      K8SIoApiCoreV1PodOs: {
        type: "object",
        properties: {
          name: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1OsName",
              },
            ],
            description:
              "Name is the name of the operating system. The currently supported values are linux and windows. Additional value may be defined in future and can be one of: https://github.com/opencontainers/runtime-spec/blob/master/config.md#platform-specific-configuration Clients should expect to handle additional values and treat unrecognized values in this field as os: null",
            "x-go-field-name": "Name",
          },
        },
        additionalProperties: false,
        required: ["name"],
        "x-go-vendor-type": "k8s.io/api/core/v1.PodOS",
      },
      K8SIoApiCoreV1PodReadinessGate: {
        type: "object",
        properties: {
          conditionType: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PodConditionType",
              },
            ],
            description:
              "ConditionType refers to a condition in the pod's condition list with matching type.",
            "x-go-field-name": "ConditionType",
          },
        },
        additionalProperties: false,
        required: ["conditionType"],
        "x-go-vendor-type": "k8s.io/api/core/v1.PodReadinessGate",
      },
      K8SIoApiCoreV1PodResourceClaim: {
        type: "object",
        properties: {
          name: {
            type: "string",
            "x-go-field-name": "Name",
          },
          source: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1ClaimSource",
              },
            ],
            description: "Source describes where to find the ResourceClaim.",
            "x-go-field-name": "Source",
          },
        },
        additionalProperties: false,
        required: ["name"],
        "x-go-vendor-type": "k8s.io/api/core/v1.PodResourceClaim",
      },
      K8SIoApiCoreV1PodSchedulingGate: {
        type: "object",
        properties: {
          name: {
            type: "string",
            "x-go-field-name": "Name",
          },
        },
        additionalProperties: false,
        required: ["name"],
        "x-go-vendor-type": "k8s.io/api/core/v1.PodSchedulingGate",
      },
      K8SIoApiCoreV1PodSecurityContext: {
        type: "object",
        properties: {
          fsGroup: {
            type: "integer",
            format: "int64",
            nullable: true,
            "x-go-field-name": "FSGroup",
            "x-go-star-level": 1,
          },
          fsGroupChangePolicy: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PodFsGroupChangePolicy",
              },
            ],
            "x-go-field-name": "FSGroupChangePolicy",
            nullable: true,
            "x-go-star-level": 1,
          },
          runAsGroup: {
            type: "integer",
            format: "int64",
            nullable: true,
            "x-go-field-name": "RunAsGroup",
            "x-go-star-level": 1,
          },
          runAsNonRoot: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "RunAsNonRoot",
            "x-go-star-level": 1,
          },
          runAsUser: {
            type: "integer",
            format: "int64",
            nullable: true,
            "x-go-field-name": "RunAsUser",
            "x-go-star-level": 1,
          },
          seLinuxOptions: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1SeLinuxOptions",
              },
            ],
            "x-go-field-name": "SELinuxOptions",
            nullable: true,
            "x-go-star-level": 1,
          },
          seccompProfile: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1SeccompProfile",
              },
            ],
            "x-go-field-name": "SeccompProfile",
            nullable: true,
            "x-go-star-level": 1,
          },
          supplementalGroups: {
            type: "array",
            items: {
              type: "integer",
              format: "int64",
            },
            "x-go-field-name": "SupplementalGroups",
          },
          sysctls: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1Sysctl",
            },
            "x-go-field-name": "Sysctls",
          },
          windowsOptions: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1WindowsSecurityContextOptions",
              },
            ],
            "x-go-field-name": "WindowsOptions",
            nullable: true,
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.PodSecurityContext",
      },
      K8SIoApiCoreV1PodSpec: {
        type: "object",
        properties: {
          activeDeadlineSeconds: {
            type: "integer",
            format: "int64",
            nullable: true,
            "x-go-field-name": "ActiveDeadlineSeconds",
            "x-go-star-level": 1,
          },
          affinity: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1Affinity",
              },
            ],
            "x-go-field-name": "Affinity",
            nullable: true,
            "x-go-star-level": 1,
          },
          automountServiceAccountToken: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "AutomountServiceAccountToken",
            "x-go-star-level": 1,
          },
          dnsConfig: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PodDnsConfig",
              },
            ],
            "x-go-field-name": "DNSConfig",
            nullable: true,
            "x-go-star-level": 1,
          },
          dnsPolicy: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1DnsPolicy",
              },
            ],
            description:
              "Set DNS policy for the pod. Defaults to \"ClusterFirst\". Valid values are 'ClusterFirstWithHostNet', 'ClusterFirst', 'Default' or 'None'. DNS parameters given in DNSConfig will be merged with the policy selected with DNSPolicy. To have DNS options set along with hostNetwork, you have to specify DNS policy explicitly to 'ClusterFirstWithHostNet'.",
            "x-go-field-name": "DNSPolicy",
          },
          enableServiceLinks: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "EnableServiceLinks",
            "x-go-star-level": 1,
          },
          hostAliases: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1HostAlias",
            },
            "x-go-field-name": "HostAliases",
          },
          hostIPC: {
            type: "boolean",
            "x-go-field-name": "HostIPC",
          },
          hostNetwork: {
            type: "boolean",
            "x-go-field-name": "HostNetwork",
          },
          hostPID: {
            type: "boolean",
            "x-go-field-name": "HostPID",
          },
          hostUsers: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "HostUsers",
            "x-go-star-level": 1,
          },
          hostname: {
            type: "string",
            "x-go-field-name": "Hostname",
          },
          imagePullSecrets: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1LocalObjectReference",
            },
            "x-go-field-name": "ImagePullSecrets",
          },
          nodeName: {
            type: "string",
            "x-go-field-name": "NodeName",
          },
          nodeSelector: {
            type: "object",
            additionalProperties: {
              type: "string",
            },
            propertyNames: {
              type: "string",
            },
            "x-go-field-name": "NodeSelector",
          },
          os: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PodOs",
              },
            ],
            "x-go-field-name": "OS",
            nullable: true,
            "x-go-star-level": 1,
          },
          overhead: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1ResourceList",
              },
            ],
            description:
              "Overhead represents the resource overhead associated with running a pod for a given RuntimeClass. This field will be autopopulated at admission time by the RuntimeClass admission controller. If the RuntimeClass admission controller is enabled, overhead must not be set in Pod create requests. The RuntimeClass admission controller will reject Pod create requests which have the overhead already set. If RuntimeClass is configured and selected in the PodSpec, Overhead will be set to the value defined in the corresponding RuntimeClass, otherwise it will remain unset and treated as zero. More info: https://git.k8s.io/enhancements/keps/sig-node/688-pod-overhead/README.md",
            "x-go-field-name": "Overhead",
          },
          preemptionPolicy: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PreemptionPolicy",
              },
            ],
            "x-go-field-name": "PreemptionPolicy",
            nullable: true,
            "x-go-star-level": 1,
          },
          priority: {
            type: "integer",
            format: "int32",
            nullable: true,
            "x-go-field-name": "Priority",
            "x-go-star-level": 1,
          },
          priorityClassName: {
            type: "string",
            "x-go-field-name": "PriorityClassName",
          },
          readinessGates: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1PodReadinessGate",
            },
            "x-go-field-name": "ReadinessGates",
          },
          resourceClaims: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1PodResourceClaim",
            },
            "x-go-field-name": "ResourceClaims",
          },
          restartPolicy: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1RestartPolicy",
              },
            ],
            description:
              "Restart policy for all containers within the pod. One of Always, OnFailure, Never. Default to Always. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#restart-policy",
            "x-go-field-name": "RestartPolicy",
          },
          runtimeClassName: {
            type: "string",
            nullable: true,
            "x-go-field-name": "RuntimeClassName",
            "x-go-star-level": 1,
          },
          schedulerName: {
            type: "string",
            "x-go-field-name": "SchedulerName",
          },
          schedulingGates: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1PodSchedulingGate",
            },
            "x-go-field-name": "SchedulingGates",
          },
          securityContext: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PodSecurityContext",
              },
            ],
            "x-go-field-name": "SecurityContext",
            nullable: true,
            "x-go-star-level": 1,
          },
          serviceAccount: {
            type: "string",
            "x-go-field-name": "DeprecatedServiceAccount",
          },
          serviceAccountName: {
            type: "string",
            "x-go-field-name": "ServiceAccountName",
          },
          setHostnameAsFQDN: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "SetHostnameAsFQDN",
            "x-go-star-level": 1,
          },
          shareProcessNamespace: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "ShareProcessNamespace",
            "x-go-star-level": 1,
          },
          subdomain: {
            type: "string",
            "x-go-field-name": "Subdomain",
          },
          terminationGracePeriodSeconds: {
            type: "integer",
            format: "int64",
            nullable: true,
            "x-go-field-name": "TerminationGracePeriodSeconds",
            "x-go-star-level": 1,
          },
          tolerations: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1Toleration",
            },
            "x-go-field-name": "Tolerations",
          },
          topologySpreadConstraints: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1TopologySpreadConstraint",
            },
            "x-go-field-name": "TopologySpreadConstraints",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.PodSpec",
      },
      K8SIoApiCoreV1PodTemplateSpec: {
        type: "object",
        properties: {
          metadata: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisMetaV1ObjectMeta",
              },
            ],
            description:
              "Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata",
            "x-go-field-name": "ObjectMeta",
          },
          spec: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PodSpec",
              },
            ],
            "x-go-field-name": "Spec",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.PodTemplateSpec",
      },
      K8SIoApiCoreV1PreemptionPolicy: {
        type: "string",
        enum: ["Never", "PreemptLowerPriority"],
        "x-go-vendor-type": "k8s.io/api/core/v1.PreemptionPolicy",
      },
      K8SIoApiCoreV1PreferredSchedulingTerm: {
        type: "object",
        properties: {
          preference: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1NodeSelectorTerm",
              },
            ],
            description:
              "A node selector term, associated with the corresponding weight.",
            "x-go-field-name": "Preference",
          },
          weight: {
            type: "integer",
            format: "int32",
            "x-go-field-name": "Weight",
          },
        },
        additionalProperties: false,
        required: ["weight", "preference"],
        "x-go-vendor-type": "k8s.io/api/core/v1.PreferredSchedulingTerm",
      },
      K8SIoApiCoreV1Probe: {
        allOf: [
          {
            $ref: "#/components/schemas/K8SIoApiCoreV1ProbeHandler",
          },
          {
            type: "object",
            properties: {
              failureThreshold: {
                type: "integer",
                format: "int32",
                "x-go-field-name": "FailureThreshold",
              },
              initialDelaySeconds: {
                type: "integer",
                format: "int32",
                "x-go-field-name": "InitialDelaySeconds",
              },
              periodSeconds: {
                type: "integer",
                format: "int32",
                "x-go-field-name": "PeriodSeconds",
              },
              successThreshold: {
                type: "integer",
                format: "int32",
                "x-go-field-name": "SuccessThreshold",
              },
              terminationGracePeriodSeconds: {
                type: "integer",
                format: "int64",
                nullable: true,
                "x-go-field-name": "TerminationGracePeriodSeconds",
                "x-go-star-level": 1,
              },
              timeoutSeconds: {
                type: "integer",
                format: "int32",
                "x-go-field-name": "TimeoutSeconds",
              },
            },
            additionalProperties: false,
          },
        ],
        "x-go-vendor-type": "k8s.io/api/core/v1.Probe",
      },
      K8SIoApiCoreV1ProbeHandler: {
        type: "object",
        properties: {
          exec: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1ExecAction",
              },
            ],
            "x-go-field-name": "Exec",
            nullable: true,
            "x-go-star-level": 1,
          },
          grpc: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1GrpcAction",
              },
            ],
            "x-go-field-name": "GRPC",
            nullable: true,
            "x-go-star-level": 1,
          },
          httpGet: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1HttpGetAction",
              },
            ],
            "x-go-field-name": "HTTPGet",
            nullable: true,
            "x-go-star-level": 1,
          },
          tcpSocket: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1TcpSocketAction",
              },
            ],
            "x-go-field-name": "TCPSocket",
            nullable: true,
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.ProbeHandler",
      },
      K8SIoApiCoreV1ProcMountType: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.ProcMountType",
      },
      K8SIoApiCoreV1PullPolicy: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.PullPolicy",
      },
      K8SIoApiCoreV1ResourceClaim: {
        type: "object",
        properties: {
          name: {
            type: "string",
            "x-go-field-name": "Name",
          },
        },
        additionalProperties: false,
        required: ["name"],
        "x-go-vendor-type": "k8s.io/api/core/v1.ResourceClaim",
      },
      K8SIoApiCoreV1ResourceList: {
        type: "object",
        additionalProperties: {
          $ref: "#/components/schemas/ApiResourceQuantity",
        },
        propertyNames: {
          $ref: "#/components/schemas/K8SIoApiCoreV1ResourceName",
        },
        "x-go-vendor-type": "k8s.io/api/core/v1.ResourceList",
      },
      K8SIoApiCoreV1ResourceName: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.ResourceName",
      },
      K8SIoApiCoreV1ResourceRequirements: {
        type: "object",
        properties: {
          claims: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1ResourceClaim",
            },
            "x-go-field-name": "Claims",
          },
          limits: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1ResourceList",
              },
            ],
            description:
              "Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/",
            "x-go-field-name": "Limits",
          },
          requests: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1ResourceList",
              },
            ],
            description:
              "Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/",
            "x-go-field-name": "Requests",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.ResourceRequirements",
      },
      K8SIoApiCoreV1RestartPolicy: {
        type: "string",
        enum: ["Always", "OnFailure", "Never"],
        "x-go-vendor-type": "k8s.io/api/core/v1.RestartPolicy",
      },
      K8SIoApiCoreV1SeLinuxOptions: {
        type: "object",
        properties: {
          level: {
            type: "string",
            "x-go-field-name": "Level",
          },
          role: {
            type: "string",
            "x-go-field-name": "Role",
          },
          type: {
            type: "string",
            "x-go-field-name": "Type",
          },
          user: {
            type: "string",
            "x-go-field-name": "User",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.SELinuxOptions",
      },
      K8SIoApiCoreV1SeccompProfile: {
        type: "object",
        properties: {
          localhostProfile: {
            type: "string",
            nullable: true,
            "x-go-field-name": "LocalhostProfile",
            "x-go-star-level": 1,
          },
          type: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1SeccompProfileType",
              },
            ],
            description:
              "type indicates which kind of seccomp profile will be applied. Valid options are:\n\nLocalhost - a profile defined in a file on the node should be used. RuntimeDefault - the container runtime default profile should be used. Unconfined - no profile should be applied.",
            "x-go-field-name": "Type",
          },
        },
        additionalProperties: false,
        required: ["type"],
        "x-go-vendor-type": "k8s.io/api/core/v1.SeccompProfile",
      },
      K8SIoApiCoreV1SeccompProfileType: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.SeccompProfileType",
      },
      K8SIoApiCoreV1SecretVolumeSource: {
        type: "object",
        properties: {
          defaultMode: {
            type: "integer",
            format: "int32",
            nullable: true,
            "x-go-field-name": "DefaultMode",
            "x-go-star-level": 1,
          },
          items: {
            type: "array",
            items: {
              $ref: "#/components/schemas/K8SIoApiCoreV1KeyToPath",
            },
            "x-go-field-name": "Items",
          },
          optional: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "Optional",
            "x-go-star-level": 1,
          },
          secretName: {
            type: "string",
            "x-go-field-name": "SecretName",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.SecretVolumeSource",
      },
      K8SIoApiCoreV1SecurityContext: {
        type: "object",
        properties: {
          allowPrivilegeEscalation: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "AllowPrivilegeEscalation",
            "x-go-star-level": 1,
          },
          capabilities: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1Capabilities",
              },
            ],
            "x-go-field-name": "Capabilities",
            nullable: true,
            "x-go-star-level": 1,
          },
          privileged: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "Privileged",
            "x-go-star-level": 1,
          },
          procMount: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1ProcMountType",
              },
            ],
            "x-go-field-name": "ProcMount",
            nullable: true,
            "x-go-star-level": 1,
          },
          readOnlyRootFilesystem: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "ReadOnlyRootFilesystem",
            "x-go-star-level": 1,
          },
          runAsGroup: {
            type: "integer",
            format: "int64",
            nullable: true,
            "x-go-field-name": "RunAsGroup",
            "x-go-star-level": 1,
          },
          runAsNonRoot: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "RunAsNonRoot",
            "x-go-star-level": 1,
          },
          runAsUser: {
            type: "integer",
            format: "int64",
            nullable: true,
            "x-go-field-name": "RunAsUser",
            "x-go-star-level": 1,
          },
          seLinuxOptions: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1SeLinuxOptions",
              },
            ],
            "x-go-field-name": "SELinuxOptions",
            nullable: true,
            "x-go-star-level": 1,
          },
          seccompProfile: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1SeccompProfile",
              },
            ],
            "x-go-field-name": "SeccompProfile",
            nullable: true,
            "x-go-star-level": 1,
          },
          windowsOptions: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1WindowsSecurityContextOptions",
              },
            ],
            "x-go-field-name": "WindowsOptions",
            nullable: true,
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.SecurityContext",
      },
      K8SIoApiCoreV1StorageMedium: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.StorageMedium",
      },
      K8SIoApiCoreV1Sysctl: {
        type: "object",
        properties: {
          name: {
            type: "string",
            "x-go-field-name": "Name",
          },
          value: {
            type: "string",
            "x-go-field-name": "Value",
          },
        },
        additionalProperties: false,
        required: ["name", "value"],
        "x-go-vendor-type": "k8s.io/api/core/v1.Sysctl",
      },
      K8SIoApiCoreV1TaintEffect: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.TaintEffect",
      },
      K8SIoApiCoreV1TcpSocketAction: {
        type: "object",
        properties: {
          host: {
            type: "string",
            "x-go-field-name": "Host",
          },
          port: {
            allOf: [
              {
                $ref: "#/components/schemas/UtilIntstrIntOrString",
              },
            ],
            description:
              "Number or name of the port to access on the container. Number must be in the range 1 to 65535. Name must be an IANA_SVC_NAME.",
            "x-go-field-name": "Port",
          },
        },
        additionalProperties: false,
        required: ["port"],
        "x-go-vendor-type": "k8s.io/api/core/v1.TCPSocketAction",
      },
      K8SIoApiCoreV1TerminationMessagePolicy: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.TerminationMessagePolicy",
      },
      K8SIoApiCoreV1Toleration: {
        type: "object",
        properties: {
          effect: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1TaintEffect",
              },
            ],
            description:
              "Effect indicates the taint effect to match. Empty means match all taint effects. When specified, allowed values are NoSchedule, PreferNoSchedule and NoExecute.",
            "x-go-field-name": "Effect",
          },
          key: {
            type: "string",
            "x-go-field-name": "Key",
          },
          operator: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1TolerationOperator",
              },
            ],
            description:
              "Operator represents a key's relationship to the value. Valid operators are Exists and Equal. Defaults to Equal. Exists is equivalent to wildcard for value, so that a pod can tolerate all taints of a particular category.",
            "x-go-field-name": "Operator",
          },
          tolerationSeconds: {
            type: "integer",
            format: "int64",
            nullable: true,
            "x-go-field-name": "TolerationSeconds",
            "x-go-star-level": 1,
          },
          value: {
            type: "string",
            "x-go-field-name": "Value",
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.Toleration",
      },
      K8SIoApiCoreV1TolerationOperator: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.TolerationOperator",
      },
      K8SIoApiCoreV1TopologySpreadConstraint: {
        type: "object",
        properties: {
          labelSelector: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisMetaV1LabelSelector",
              },
            ],
            "x-go-field-name": "LabelSelector",
            nullable: true,
            "x-go-star-level": 1,
          },
          matchLabelKeys: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "MatchLabelKeys",
          },
          maxSkew: {
            type: "integer",
            format: "int32",
            "x-go-field-name": "MaxSkew",
          },
          minDomains: {
            type: "integer",
            format: "int32",
            nullable: true,
            "x-go-field-name": "MinDomains",
            "x-go-star-level": 1,
          },
          nodeAffinityPolicy: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1NodeInclusionPolicy",
              },
            ],
            "x-go-field-name": "NodeAffinityPolicy",
            nullable: true,
            "x-go-star-level": 1,
          },
          nodeTaintsPolicy: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1NodeInclusionPolicy",
              },
            ],
            "x-go-field-name": "NodeTaintsPolicy",
            nullable: true,
            "x-go-star-level": 1,
          },
          topologyKey: {
            type: "string",
            "x-go-field-name": "TopologyKey",
          },
          whenUnsatisfiable: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1UnsatisfiableConstraintAction",
              },
            ],
            description:
              'WhenUnsatisfiable indicates how to deal with a pod if it doesn\'t satisfy the spread constraint. - DoNotSchedule (default) tells the scheduler not to schedule it. - ScheduleAnyway tells the scheduler to schedule the pod in any location,\n  but giving higher precedence to topologies that would help reduce the\n  skew.\nA constraint is considered "Unsatisfiable" for an incoming pod if and only if every possible node assignment for that pod would violate "MaxSkew" on some topology. For example, in a 3-zone cluster, MaxSkew is set to 1, and pods with the same labelSelector spread as 3/1/1: ',
            "x-go-field-name": "WhenUnsatisfiable",
          },
        },
        additionalProperties: false,
        required: ["maxSkew", "topologyKey", "whenUnsatisfiable"],
        "x-go-vendor-type": "k8s.io/api/core/v1.TopologySpreadConstraint",
      },
      K8SIoApiCoreV1TypedLocalObjectReference: {
        type: "object",
        properties: {
          apiGroup: {
            type: "string",
            "x-go-field-name": "APIGroup",
            "x-go-star-level": 1,
          },
          kind: {
            type: "string",
            "x-go-field-name": "Kind",
          },
          name: {
            type: "string",
            "x-go-field-name": "Name",
          },
        },
        additionalProperties: false,
        required: ["apiGroup", "kind", "name"],
        "x-go-vendor-type": "k8s.io/api/core/v1.TypedLocalObjectReference",
      },
      K8SIoApiCoreV1TypedObjectReference: {
        type: "object",
        properties: {
          apiGroup: {
            type: "string",
            "x-go-field-name": "APIGroup",
            "x-go-star-level": 1,
          },
          kind: {
            type: "string",
            "x-go-field-name": "Kind",
          },
          name: {
            type: "string",
            "x-go-field-name": "Name",
          },
          namespace: {
            type: "string",
            nullable: true,
            "x-go-field-name": "Namespace",
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        required: ["apiGroup", "kind", "name"],
        "x-go-vendor-type": "k8s.io/api/core/v1.TypedObjectReference",
      },
      K8SIoApiCoreV1UnsatisfiableConstraintAction: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.UnsatisfiableConstraintAction",
      },
      K8SIoApiCoreV1UriScheme: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.URIScheme",
      },
      K8SIoApiCoreV1WeightedPodAffinityTerm: {
        type: "object",
        properties: {
          podAffinityTerm: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1PodAffinityTerm",
              },
            ],
            description:
              "Required. A pod affinity term, associated with the corresponding weight.",
            "x-go-field-name": "PodAffinityTerm",
          },
          weight: {
            type: "integer",
            format: "int32",
            "x-go-field-name": "Weight",
          },
        },
        additionalProperties: false,
        required: ["weight", "podAffinityTerm"],
        "x-go-vendor-type": "k8s.io/api/core/v1.WeightedPodAffinityTerm",
      },
      K8SIoApiCoreV1WindowsSecurityContextOptions: {
        type: "object",
        properties: {
          gmsaCredentialSpec: {
            type: "string",
            nullable: true,
            "x-go-field-name": "GMSACredentialSpec",
            "x-go-star-level": 1,
          },
          gmsaCredentialSpecName: {
            type: "string",
            nullable: true,
            "x-go-field-name": "GMSACredentialSpecName",
            "x-go-star-level": 1,
          },
          hostProcess: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "HostProcess",
            "x-go-star-level": 1,
          },
          runAsUserName: {
            type: "string",
            nullable: true,
            "x-go-field-name": "RunAsUserName",
            "x-go-star-level": 1,
          },
        },
        additionalProperties: false,
        "x-go-vendor-type": "k8s.io/api/core/v1.WindowsSecurityContextOptions",
      },
      K8SIoApiRbacV1PolicyRule: {
        type: "object",
        properties: {
          apiGroups: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "APIGroups",
          },
          nonResourceURLs: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "NonResourceURLs",
          },
          resourceNames: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "ResourceNames",
          },
          resources: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "Resources",
          },
          verbs: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "Verbs",
          },
        },
        additionalProperties: false,
        required: ["verbs"],
        "x-go-vendor-type": "k8s.io/api/rbac/v1.PolicyRule",
      },
      Kubepkg: {
        allOf: [
          {
            $ref: "#/components/schemas/DatatypesCreationUpdationDeletionTime",
          },
          {
            type: "object",
            properties: {
              group: {
                type: "string",
                description: "Kubepkg Group",
                "x-go-field-name": "Group",
              },
              kubepkgID: {
                allOf: [
                  {
                    $ref: "#/components/schemas/KubepkgId",
                  },
                ],
                description: "Kubepkg ID",
                "x-go-field-name": "ID",
              },
              name: {
                type: "string",
                description: "Kubepkg 名称",
                "x-go-field-name": "Name",
              },
            },
            additionalProperties: false,
            required: ["kubepkgID", "group", "name"],
          },
        ],
      },
      KubepkgChannel: {
        type: "string",
        enum: ["DEV", "BETA", "RC", "STABLE"],
        "x-enum-labels": ["开发", "测试", "预览", "正式"],
      },
      KubepkgId: {
        type: "string",
      },
      KubepkgRevisionId: {
        type: "string",
      },
      KubepkgVersionInfo: {
        type: "object",
        properties: {
          revisionID: {
            allOf: [
              {
                $ref: "#/components/schemas/KubepkgRevisionId",
              },
            ],
            "x-go-field-name": "RevisionID",
          },
          version: {
            type: "string",
            "x-go-field-name": "Version",
          },
        },
        additionalProperties: false,
        required: ["revisionID", "version"],
      },
      RbacPermissions: {
        type: "object",
        additionalProperties: {
          type: "array",
          items: {},
        },
        propertyNames: {
          type: "string",
        },
        "x-go-vendor-type": "github.com/octohelm/kubepkg/pkg/rbac.Permissions",
      },
      StatuserrorErrorField: {
        type: "object",
        properties: {
          field: {
            type: "string",
            description: "field path\nprop.slice[2].a",
            "x-go-field-name": "Field",
          },
          in: {
            type: "string",
            description: "location\neq. body, query, header, path, formData",
            "x-go-field-name": "In",
          },
          msg: {
            type: "string",
            description: "msg",
            "x-go-field-name": "Msg",
          },
        },
        additionalProperties: false,
        required: ["field", "msg", "in"],
        "x-go-vendor-type":
          "github.com/octohelm/courier/pkg/statuserror.ErrorField",
      },
      StatuserrorErrorFields: {
        type: "array",
        items: {
          allOf: [
            {
              $ref: "#/components/schemas/StatuserrorErrorField",
            },
            {
              nullable: true,
              "x-go-star-level": 1,
            },
          ],
        },
        "x-go-vendor-type":
          "github.com/octohelm/courier/pkg/statuserror.ErrorFields",
      },
      StatuserrorStatusErr: {
        type: "object",
        properties: {
          canBeTalkError: {
            type: "boolean",
            description:
              "can be task error\nfor client to should error msg to end user",
            "x-go-field-name": "CanBeTalkError",
          },
          code: {
            type: "integer",
            format: "int32",
            description: "http code",
            "x-go-field-name": "Code",
          },
          desc: {
            type: "string",
            description: "desc of err",
            "x-go-field-name": "Desc",
          },
          errorFields: {
            allOf: [
              {
                $ref: "#/components/schemas/StatuserrorErrorFields",
              },
              {
                description: "error in where fields",
                "x-go-field-name": "ErrorFields",
              },
            ],
          },
          key: {
            type: "string",
            description: "key of err",
            "x-go-field-name": "Key",
          },
          msg: {
            type: "string",
            description: "msg of err",
            "x-go-field-name": "Msg",
          },
          sources: {
            type: "array",
            items: {
              type: "string",
            },
            description: "error tracing",
            "x-go-field-name": "Sources",
          },
        },
        additionalProperties: false,
        required: [
          "code",
          "key",
          "msg",
          "desc",
          "canBeTalkError",
          "sources",
          "errorFields",
        ],
        "x-go-vendor-type":
          "github.com/octohelm/courier/pkg/statuserror.StatusErr",
      },
      StrfmtDuration: {
        type: "string",
        "x-go-vendor-type": "github.com/octohelm/kubepkg/pkg/strfmt.Duration",
      },
      UtilIntstrIntOrString: {
        oneOf: [
          {
            type: "integer",
            format: "int32",
          },
          {
            type: "string",
          },
        ],
      },
    },
  },
};
