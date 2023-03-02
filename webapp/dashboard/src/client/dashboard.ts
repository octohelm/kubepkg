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

export type ApisMetaV1Time = string;

export interface ApisMetaV1FieldsV1 {}

export type ApisMetaV1ManagedFieldsOperationType = string;

export interface ApisMetaV1ManagedFieldsEntry {
  apiVersion?: string;
  fieldsType?: string;
  fieldsV1?: ApisMetaV1FieldsV1;
  manager?: string;
  operation?: ApisMetaV1ManagedFieldsOperationType;
  subresource?: string;
  time?: ApisMetaV1Time;
}

export type TypesUid = string;

export interface ApisMetaV1OwnerReference {
  apiVersion: string;
  blockOwnerDeletion?: boolean;
  controller?: boolean;
  kind: string;
  name: string;
  uid: TypesUid;
}

export interface ApisMetaV1ObjectMeta {
  annotations?: {
    [k: string]: string;
  };
  creationTimestamp?: string;
  deletionGracePeriodSeconds?: number;
  deletionTimestamp?: ApisMetaV1Time;
  finalizers?: Array<string>;
  generateName?: string;
  generation?: number;
  labels?: {
    [k: string]: string;
  };
  managedFields?: Array<ApisMetaV1ManagedFieldsEntry>;
  name?: string;
  namespace?: string;
  ownerReferences?: Array<ApisMetaV1OwnerReference>;
  resourceVersion?: string;
  selfLink?: string;
  uid?: TypesUid;
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

export type K8SIoApiCoreV1UriScheme = string;

export interface K8SIoApiCoreV1HttpGetAction {
  host?: string;
  httpHeaders?: Array<K8SIoApiCoreV1HttpHeader>;
  path?: string;
  port: number | string;
  scheme?: K8SIoApiCoreV1UriScheme;
}

export type UtilIntstrIntOrString = number | string;

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

export interface K8SIoApiCoreV1ResourceList {
  [k: K8SIoApiCoreV1ResourceName]: string;
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

export enum ApisKubepkgV1Alpha1DeployKind {
  ConfigMap = "ConfigMap",
  CronJob = "CronJob",
  DaemonSet = "DaemonSet",
  Deployment = "Deployment",
  Job = "Job",
  Secret = "Secret",
  StatefulSet = "StatefulSet",
}

export interface ApisKubepkgV1Alpha1SpecObject {
  [k: string]: any;
}

export interface ApisKubepkgV1Alpha1Deploy {
  annotations?: {
    [k: string]: string;
  };
  kind: keyof typeof ApisKubepkgV1Alpha1DeployKind;
  spec?: ApisKubepkgV1Alpha1SpecObject;
}

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

export interface ApisKubepkgV1Alpha1Volume {
  mountPath: string;
  opt?: ApisKubepkgV1Alpha1SpecObject;
  optional?: boolean;
  prefix?: string;
  readOnly?: boolean;
  spec?: ApisKubepkgV1Alpha1SpecObject;
  subPath?: string;
  type: string;
}

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
  openapi: "3.0.3",
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
                    $ref: "#/components/schemas/AuthProviderInfo",
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
                    $ref: "#/components/schemas/Cluster",
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
                    $ref: "#/components/schemas/Group",
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
                    $ref: "#/components/schemas/GroupEnvWithCluster",
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
                      $ref: "#/components/schemas/ApisKubepkgV1Alpha1KubePkg",
                    },
                  },
                },
              },
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
                    $ref: "#/components/schemas/Kubepkg",
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
                      $ref: "#/components/schemas/KubepkgVersionInfo",
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
                    $ref: "#/components/schemas/KubepkgVersionInfo",
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
            required: ["accountID", "accountType"],
          },
        ],
        description: "Account",
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
          },
        ],
      },
      AccountUserDataList: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              $ref: "#/components/schemas/AccountUser",
            },
            "x-go-field-name": "Data",
          },
          total: {
            type: "integer",
            format: "int32",
            "x-go-field-name": "Total",
          },
        },
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
          },
          livenessProbe: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1Probe",
              },
            ],
            "x-go-field-name": "LivenessProbe",
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
          },
          resources: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1ResourceRequirements",
              },
            ],
            "x-go-field-name": "Resources",
          },
          securityContext: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1SecurityContext",
              },
            ],
            "x-go-field-name": "SecurityContext",
          },
          startupProbe: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1Probe",
              },
            ],
            "x-go-field-name": "StartupProbe",
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
        required: ["image"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.Container",
      },
      ApisKubepkgV1Alpha1Deploy: {
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
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1DeployKind",
              },
            ],
            "x-go-field-name": "Kind",
          },
          spec: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1SpecObject",
              },
            ],
            "x-go-field-name": "Spec",
          },
        },
        required: ["kind"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.Deploy",
      },
      ApisKubepkgV1Alpha1DeployKind: {
        type: "string",
        enum: [
          "ConfigMap",
          "CronJob",
          "DaemonSet",
          "Deployment",
          "Job",
          "Secret",
          "StatefulSet",
        ],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.DeployKind",
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
              },
            },
            required: ["spec"],
          },
        ],
        description: "KubePkg",
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
            required: ["items"],
          },
        ],
        description: "KubePkgList",
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
        required: ["version"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.Spec",
      },
      ApisKubepkgV1Alpha1SpecObject: {
        type: "object",
        additionalProperties: {},
        propertyNames: {
          type: "string",
        },
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.SpecObject",
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
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.Status",
      },
      ApisKubepkgV1Alpha1Volume: {
        type: "object",
        properties: {
          mountPath: {
            type: "string",
            "x-go-field-name": "MountPath",
          },
          opt: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1SpecObject",
              },
            ],
            description: "VolumeSource as opt",
            "x-go-field-name": "Opt",
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
          spec: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1SpecObject",
              },
            ],
            description:
              "Spec when Type equals ConfigMap or Secret, could use to define data",
            "x-go-field-name": "Spec",
          },
          subPath: {
            type: "string",
            "x-go-field-name": "SubPath",
          },
          type: {
            type: "string",
            "x-go-field-name": "Type",
          },
        },
        required: ["mountPath", "type"],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.Volume",
      },
      ApisMetaV1FieldsV1: {
        type: "object",
        "x-go-vendor-type": "k8s.io/apimachinery/pkg/apis/meta/v1.FieldsV1",
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
        "x-go-vendor-type": "k8s.io/apimachinery/pkg/apis/meta/v1.ListMeta",
      },
      ApisMetaV1ManagedFieldsEntry: {
        type: "object",
        properties: {
          apiVersion: {
            type: "string",
            "x-go-field-name": "APIVersion",
          },
          fieldsType: {
            type: "string",
            "x-go-field-name": "FieldsType",
          },
          fieldsV1: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisMetaV1FieldsV1",
              },
            ],
            "x-go-field-name": "FieldsV1",
          },
          manager: {
            type: "string",
            "x-go-field-name": "Manager",
          },
          operation: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisMetaV1ManagedFieldsOperationType",
              },
            ],
            "x-go-field-name": "Operation",
          },
          subresource: {
            type: "string",
            "x-go-field-name": "Subresource",
          },
          time: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisMetaV1Time",
              },
            ],
            "x-go-field-name": "Time",
          },
        },
        "x-go-vendor-type":
          "k8s.io/apimachinery/pkg/apis/meta/v1.ManagedFieldsEntry",
      },
      ApisMetaV1ManagedFieldsOperationType: {
        type: "string",
        "x-go-vendor-type":
          "k8s.io/apimachinery/pkg/apis/meta/v1.ManagedFieldsOperationType",
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
          creationTimestamp: {
            type: "string",
            format: "date-time",
            "x-go-field-name": "CreationTimestamp",
          },
          deletionGracePeriodSeconds: {
            type: "integer",
            format: "int64",
            nullable: true,
            "x-go-field-name": "DeletionGracePeriodSeconds",
            "x-go-star-level": 1,
          },
          deletionTimestamp: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisMetaV1Time",
              },
            ],
            "x-go-field-name": "DeletionTimestamp",
          },
          finalizers: {
            type: "array",
            items: {
              type: "string",
            },
            "x-go-field-name": "Finalizers",
          },
          generateName: {
            type: "string",
            "x-go-field-name": "GenerateName",
          },
          generation: {
            type: "integer",
            format: "int64",
            "x-go-field-name": "Generation",
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
          managedFields: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ApisMetaV1ManagedFieldsEntry",
            },
            "x-go-field-name": "ManagedFields",
          },
          name: {
            type: "string",
            "x-go-field-name": "Name",
          },
          namespace: {
            type: "string",
            "x-go-field-name": "Namespace",
          },
          ownerReferences: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ApisMetaV1OwnerReference",
            },
            "x-go-field-name": "OwnerReferences",
          },
          resourceVersion: {
            type: "string",
            "x-go-field-name": "ResourceVersion",
          },
          selfLink: {
            type: "string",
            "x-go-field-name": "SelfLink",
          },
          uid: {
            allOf: [
              {
                $ref: "#/components/schemas/TypesUid",
              },
            ],
            "x-go-field-name": "UID",
          },
        },
        "x-go-vendor-type": "k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta",
      },
      ApisMetaV1OwnerReference: {
        type: "object",
        properties: {
          apiVersion: {
            type: "string",
            "x-go-field-name": "APIVersion",
          },
          blockOwnerDeletion: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "BlockOwnerDeletion",
            "x-go-star-level": 1,
          },
          controller: {
            type: "boolean",
            nullable: true,
            "x-go-field-name": "Controller",
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
          uid: {
            allOf: [
              {
                $ref: "#/components/schemas/TypesUid",
              },
            ],
            "x-go-field-name": "UID",
          },
        },
        required: ["apiVersion", "kind", "name", "uid"],
        "x-go-vendor-type":
          "k8s.io/apimachinery/pkg/apis/meta/v1.OwnerReference",
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
            required: ["updatedAt"],
          },
        ],
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/datatypes.CreationUpdationTime",
      },
      DatatypesPrimaryId: {
        type: "object",
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/datatypes.PrimaryID",
      },
      DatatypesTimestamp: {
        type: "string",
        description: "openapi:strfmt date-time",
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
            required: ["groupID", "name"],
          },
        ],
        description: "Group",
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
              },
            },
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
          },
        ],
      },
      GroupRobotDataList: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              $ref: "#/components/schemas/GroupRobot",
            },
            "x-go-field-name": "Data",
          },
          total: {
            type: "integer",
            format: "int32",
            "x-go-field-name": "Total",
          },
        },
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
          },
        ],
      },
      GroupUserDataList: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              $ref: "#/components/schemas/GroupUser",
            },
            "x-go-field-name": "Data",
          },
          total: {
            type: "integer",
            format: "int32",
            "x-go-field-name": "Total",
          },
        },
        required: ["data", "total"],
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
        "x-go-vendor-type": "k8s.io/api/core/v1.Capabilities",
      },
      K8SIoApiCoreV1Capability: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.Capability",
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
        required: ["port", "service"],
        "x-go-vendor-type": "k8s.io/api/core/v1.GRPCAction",
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
            anyOf: [
              {
                type: "integer",
                format: "int32",
              },
              {
                type: "string",
              },
            ],
            "x-go-field-name": "Port",
          },
          scheme: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1UriScheme",
              },
            ],
            "x-go-field-name": "Scheme",
          },
        },
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
        required: ["name", "value"],
        "x-go-vendor-type": "k8s.io/api/core/v1.HTTPHeader",
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
          },
          preStop: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1LifecycleHandler",
              },
            ],
            "x-go-field-name": "PreStop",
          },
        },
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
          },
          httpGet: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1HttpGetAction",
              },
            ],
            "x-go-field-name": "HTTPGet",
          },
          tcpSocket: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1TcpSocketAction",
              },
            ],
            "x-go-field-name": "TCPSocket",
          },
        },
        "x-go-vendor-type": "k8s.io/api/core/v1.LifecycleHandler",
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
          },
          grpc: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1GrpcAction",
              },
            ],
            "x-go-field-name": "GRPC",
          },
          httpGet: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1HttpGetAction",
              },
            ],
            "x-go-field-name": "HTTPGet",
          },
          tcpSocket: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1TcpSocketAction",
              },
            ],
            "x-go-field-name": "TCPSocket",
          },
        },
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
        required: ["name"],
        "x-go-vendor-type": "k8s.io/api/core/v1.ResourceClaim",
      },
      K8SIoApiCoreV1ResourceList: {
        type: "object",
        additionalProperties: {
          type: "string",
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
            "x-go-field-name": "Limits",
          },
          requests: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1ResourceList",
              },
            ],
            "x-go-field-name": "Requests",
          },
        },
        "x-go-vendor-type": "k8s.io/api/core/v1.ResourceRequirements",
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
            "x-go-field-name": "Type",
          },
        },
        required: ["type"],
        "x-go-vendor-type": "k8s.io/api/core/v1.SeccompProfile",
      },
      K8SIoApiCoreV1SeccompProfileType: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.SeccompProfileType",
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
          },
          seccompProfile: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1SeccompProfile",
              },
            ],
            "x-go-field-name": "SeccompProfile",
          },
          windowsOptions: {
            allOf: [
              {
                $ref: "#/components/schemas/K8SIoApiCoreV1WindowsSecurityContextOptions",
              },
            ],
            "x-go-field-name": "WindowsOptions",
          },
        },
        "x-go-vendor-type": "k8s.io/api/core/v1.SecurityContext",
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
            "x-go-field-name": "Port",
          },
        },
        required: ["port"],
        "x-go-vendor-type": "k8s.io/api/core/v1.TCPSocketAction",
      },
      K8SIoApiCoreV1TerminationMessagePolicy: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.TerminationMessagePolicy",
      },
      K8SIoApiCoreV1UriScheme: {
        type: "string",
        "x-go-vendor-type": "k8s.io/api/core/v1.URIScheme",
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
        required: ["field", "msg", "in"],
        "x-go-vendor-type":
          "github.com/octohelm/courier/pkg/statuserror.ErrorField",
      },
      StatuserrorErrorFields: {
        type: "array",
        items: {
          $ref: "#/components/schemas/StatuserrorErrorField",
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
      TypesUid: {
        type: "string",
        "x-go-vendor-type": "k8s.io/apimachinery/pkg/types.UID",
      },
      UtilIntstrIntOrString: {
        anyOf: [
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
