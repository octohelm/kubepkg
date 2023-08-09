import { createRequest } from "./client";

import { t } from "@innoai-tech/typedef";

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
  }),
);

export const listAdminAccount = /*#__PURE__*/ createRequest<
  {
    accountID?: Array<AccountId>;
    identity?: Array<string>;
    size?: number;
    offset?: number;
    roleType?: Array<GroupRoleType>;
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
  }),
);

export const deleteAdminAccount = /*#__PURE__*/ createRequest<
  {
    accountID: AccountId;
  },
  any
>("dashboard.DeleteAdminAccount", ({ accountID: path_accountId }) => ({
  method: "DELETE",
  url: `/api/kubepkg-dashboard/v0/admin/accounts/${path_accountId}`,
}));

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
  any
>("dashboard.Authorize", ({ name: path_name, state: query_state }) => ({
  method: "GET",
  url: `/api/kubepkg-dashboard/v0/auth-providers/${path_name}/authorize`,
  params: {
    state: query_state,
  },
}));

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

export const registerClusterAgent = /*#__PURE__*/ createRequest<
  {
    body: Agent;
  },
  any
>("dashboard.RegisterClusterAgent", ({ body: body }) => ({
  method: "PUT",
  url: "/api/kubepkg-dashboard/v0/clusteragent/register",
  body: body,
  headers: {
    "Content-Type": "application/json",
  },
}));

export const listCluster = /*#__PURE__*/ createRequest<void, Array<Cluster>>(
  "dashboard.ListCluster",
  () => ({
    method: "GET",
    url: "/api/kubepkg-dashboard/v0/clusters",
  }),
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

export const createClusterAgentResources = /*#__PURE__*/ createRequest<
  {
    name: string;
  },
  Array<ClientObject>
>("dashboard.CreateClusterAgentResources", ({ name: path_name }) => ({
  method: "POST",
  url: `/api/kubepkg-dashboard/v0/clusters/${path_name}/agent/resources`,
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

export const getClusterStatus = /*#__PURE__*/ createRequest<
  {
    name: string;
  },
  ClusterInstanceStatus
>("dashboard.GetClusterStatus", ({ name: path_name }) => ({
  method: "GET",
  url: `/api/kubepkg-dashboard/v0/clusters/${path_name}/status`,
}));

export const listGroup = /*#__PURE__*/ createRequest<void, Array<Group>>(
  "dashboard.ListGroup",
  () => ({
    method: "GET",
    url: "/api/kubepkg-dashboard/v0/groups",
  }),
);

export const deleteGroup = /*#__PURE__*/ createRequest<
  {
    groupName: string;
  },
  any
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
    roleType?: Array<GroupRoleType>;
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
  }),
);

export const deleteGroupAccount = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    accountID: AccountId;
  },
  any
>(
  "dashboard.DeleteGroupAccount",
  ({ groupName: path_groupName, accountID: path_accountId }) => ({
    method: "DELETE",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/accounts/${path_accountId}`,
  }),
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
  }),
);

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
  any
>(
  "dashboard.DeleteGroupEnv",
  ({ groupName: path_groupName, envName: path_envName }) => ({
    method: "DELETE",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/envs/${path_envName}`,
  }),
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
  }),
);

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
  }),
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
  }),
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
  }),
);

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
  }),
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
  }),
);

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
  }),
);

export const deleteGroupEnvDeployment = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    envName: string;
    deploymentName: string;
  },
  any
>(
  "dashboard.DeleteGroupEnvDeployment",
  ({
    groupName: path_groupName,
    envName: path_envName,
    deploymentName: path_deploymentName,
  }) => ({
    method: "DELETE",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/envs/${path_envName}/deployments/${path_deploymentName}`,
  }),
);

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
  }),
);

export const getKubepkgRevision = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    name: string;
    channel: KubepkgChannel;
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
  }),
);

export const listKubepkgVersion = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    name: string;
    channel: KubepkgChannel;
  },
  Array<KubepkgVersionInfo>
>(
  "dashboard.ListKubepkgVersion",
  ({ groupName: path_groupName, name: path_name, channel: path_channel }) => ({
    method: "GET",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/kubepkgs/${path_name}/${path_channel}/versions`,
  }),
);

export const putKubepkgVersion = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    name: string;
    channel: KubepkgChannel;
    body: KubepkgVersionInfo;
  },
  any
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
  }),
);

export const deleteKubepkgVersion = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    name: string;
    channel: KubepkgChannel;
    version: string;
  },
  any
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
  }),
);

export const listGroupRobot = /*#__PURE__*/ createRequest<
  {
    groupName: string;
    accountID?: Array<AccountId>;
    identity?: Array<string>;
    size?: number;
    offset?: number;
    roleType?: Array<GroupRoleType>;
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
  }),
);

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
  }),
);

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
  }),
);

export const latestKubepkgs = /*#__PURE__*/ createRequest<
  {
    names: Array<string>;
  },
  { [k: string]: KubepkgVersionInfo }
>("dashboard.LatestKubepkgs", ({ names: query_names }) => ({
  method: "GET",
  url: "/api/kubepkg-dashboard/v0/latest-kubepkgs",
  params: {
    names: query_names,
  },
}));

export const currentUser = /*#__PURE__*/ createRequest<
  void,
  AuthOperatorAccount
>("dashboard.CurrentUser", () => ({
  method: "GET",
  url: "/api/kubepkg-dashboard/v0/user",
}));

export const currentPermissions = /*#__PURE__*/ createRequest<
  void,
  RbacPermissions
>("dashboard.CurrentPermissions", () => ({
  method: "GET",
  url: "/api/kubepkg-dashboard/v0/user/permissions",
}));

export type AccountId = string;

export type AccountUserDataList = {
  data: Array<AccountUser>;
  total: number;
};

export type AccountUser = Account & AccountUserInfo & {};

export type Account = DatatypesPrimaryId &
  DatatypesCreationUpdationDeletionTime & {
    accountID: AccountId;
    accountType: AccountType;
  };

export type DatatypesPrimaryId = {};

export type DatatypesCreationUpdationDeletionTime =
  DatatypesCreationUpdationTime & {
    deletedAt?: DatatypesTimestamp;
  };

export type DatatypesCreationUpdationTime = DatatypesCreationTime & {
  updatedAt: DatatypesTimestamp;
};

export type DatatypesCreationTime = {
  createdAt: DatatypesTimestamp;
};

export type DatatypesTimestamp = string;

export enum AccountType {
  USER = "USER",
  ROBOT = "ROBOT",
  AGENT = "AGENT",
}

export const displayAccountType = (v: AccountType) => {
  return (
    {
      USER: "USER",
      ROBOT: "ROBOT",
      AGENT: "AGENT",
    }[v] ?? v
  );
};

export type AccountUserInfo = {
  email?: string;
  mobile?: string;
  nickname?: string;
};

export enum GroupRoleType {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  GUEST = "GUEST",
}

export const displayGroupRoleType = (v: GroupRoleType) => {
  return (
    {
      OWNER: "拥有者",
      ADMIN: "管理员",
      MEMBER: "成员",
      GUEST: "访问者",
    }[v] ?? v
  );
};

export type GroupUserDataList = {
  data: Array<GroupUser>;
  total: number;
};

export type GroupUser = GroupAccount & AccountUserInfo & {};

export type GroupAccount = DatatypesCreationUpdationTime & {
  accountID: AccountId;
  groupID: GroupId;
  roleType: GroupRoleType;
};

export type GroupId = string;

export type GroupRoleInfo = {
  roleType: GroupRoleType;
};

export type AuthProviderInfo = {
  name: string;
  type: string;
};

export type AuthExchangeTokenData = {
  code: string;
};

export type AuthToken = {
  access_token: string;
  expires_in: number;
  id?: string;
  issued_at: Time;
  refresh_token?: string;
  token?: string;
  type: string;
};

export type Time = string;

export type Agent = {
  endpoint: string;
  labels?: { [k: string]: string };
  name: string;
  otpKeyURL?: string;
  time?: DatatypesDatetime;
  token?: string;
};

export type DatatypesDatetime = string;

export type Cluster = ClusterInfo &
  DatatypesCreationUpdationDeletionTime & {
    agentInfo?: ClusterAgentInfo;
    clusterID: ClusterId;
    name: string;
    netType: ClusterNetType;
  };

export type ClusterInfo = {
  desc?: string;
  envType: ClusterEnvType;
};

export enum ClusterEnvType {
  DEV = "DEV",
  ONLINE = "ONLINE",
}

export const displayClusterEnvType = (v: ClusterEnvType) => {
  return (
    {
      DEV: "开发集群",
      ONLINE: "生产集群",
    }[v] ?? v
  );
};

export type ClusterAgentInfo = {
  endpoint?: string;
  labels?: { [k: string]: string };
};

export type ClusterId = string;

export enum ClusterNetType {
  DIRECT = "DIRECT",
  AIRGAP = "AIRGAP",
}

export const displayClusterNetType = (v: ClusterNetType) => {
  return (
    {
      DIRECT: "可直连",
      AIRGAP: "离线",
    }[v] ?? v
  );
};

export type ClientObject = any;

export type ClusterInstanceStatus = KubeutilClusterinfoClusterInfo & {
  ping?: StrfmtDuration;
};

export type KubeutilClusterinfoClusterInfo = {
  nodes: Array<KubeutilClusterinfoClusterNode>;
};

export type KubeutilClusterinfoClusterNode = K8SIoApiCoreV1NodeSystemInfo & {
  externalIP: string;
  hostname: string;
  internalIP: string;
  role: string;
};

export type K8SIoApiCoreV1NodeSystemInfo = {
  architecture: string;
  bootID: string;
  containerRuntimeVersion: string;
  kernelVersion: string;
  kubeProxyVersion: string;
  kubeletVersion: string;
  machineID: string;
  operatingSystem: string;
  osImage: string;
  systemUUID: string;
};

export type StrfmtDuration = string;

export type Group = GroupInfo &
  DatatypesCreationUpdationDeletionTime & {
    groupID: GroupId;
    name: string;
  };

export type GroupInfo = {
  desc?: string;
  type: GroupType;
};

export enum GroupType {
  DEVELOP = "DEVELOP",
  DEPLOYMENT = "DEPLOYMENT",
}

export const displayGroupType = (v: GroupType) => {
  return (
    {
      DEVELOP: "研发",
      DEPLOYMENT: "交付组",
    }[v] ?? v
  );
};

export type GroupEnvWithCluster = GroupEnv & {
  cluster?: Cluster;
};

export type GroupEnv = GroupEnvInfo &
  GroupEnvCluster &
  DatatypesCreationUpdationDeletionTime & {
    envID: GroupEnvId;
    envName: string;
    groupID: GroupId;
  };

export type GroupEnvInfo = {
  desc: string;
  envType: GroupEnvType;
};

export enum GroupEnvType {
  DEV = "DEV",
  ONLINE = "ONLINE",
}

export const displayGroupEnvType = (v: GroupEnvType) => {
  return (
    {
      DEV: "开发环境",
      ONLINE: "线上环境",
    }[v] ?? v
  );
};

export type GroupEnvCluster = {
  namespace: string;
};

export type GroupEnvId = string;

export type ApisKubepkgV1Alpha1KubePkg = ApisMetaV1TypeMeta & {
  metadata?: ApisMetaV1ObjectMeta;
  spec: ApisKubepkgV1Alpha1Spec;
  status?: ApisKubepkgV1Alpha1Status;
};

export type ApisMetaV1TypeMeta = {
  apiVersion?: string;
  kind?: string;
};

export type ApisMetaV1ObjectMeta = {
  annotations?: { [k: string]: string };
  labels?: { [k: string]: string };
  name?: string;
  namespace?: string;
};

export type ApisKubepkgV1Alpha1Spec = {
  config?: { [k: string]: ApisKubepkgV1Alpha1EnvVarValueOrFrom };
  containers?: { [k: string]: ApisKubepkgV1Alpha1Container };
  deploy?: ApisKubepkgV1Alpha1Deploy;
  manifests?: ApisKubepkgV1Alpha1Manifests;
  serviceAccount?: ApisKubepkgV1Alpha1ServiceAccount;
  services?: { [k: string]: ApisKubepkgV1Alpha1Service };
  version: string;
  volumes?: { [k: string]: ApisKubepkgV1Alpha1Volume };
};

export type ApisKubepkgV1Alpha1EnvVarValueOrFrom = string;

export type ApisKubepkgV1Alpha1Container = {
  args?: Array<string>;
  command?: Array<string>;
  env?: { [k: string]: ApisKubepkgV1Alpha1EnvVarValueOrFrom };
  image: ApisKubepkgV1Alpha1Image;
  lifecycle?: K8SIoApiCoreV1Lifecycle;
  livenessProbe?: K8SIoApiCoreV1Probe;
  ports?: { [k: string]: number };
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
};

export type ApisKubepkgV1Alpha1Image = {
  digest?: string;
  name: string;
  platforms?: Array<string>;
  pullPolicy?: K8SIoApiCoreV1PullPolicy;
  tag?: string;
};

export type K8SIoApiCoreV1PullPolicy = string;

export type K8SIoApiCoreV1Lifecycle = {
  postStart?: K8SIoApiCoreV1LifecycleHandler;
  preStop?: K8SIoApiCoreV1LifecycleHandler;
};

export type K8SIoApiCoreV1LifecycleHandler = {
  exec?: K8SIoApiCoreV1ExecAction;
  httpGet?: K8SIoApiCoreV1HttpGetAction;
  tcpSocket?: K8SIoApiCoreV1TcpSocketAction;
};

export type K8SIoApiCoreV1ExecAction = {
  command?: Array<string>;
};

export type K8SIoApiCoreV1HttpGetAction = {
  host?: string;
  httpHeaders?: Array<K8SIoApiCoreV1HttpHeader>;
  path?: string;
  port: UtilIntstrIntOrString;
  scheme?: K8SIoApiCoreV1UriScheme;
};

export type K8SIoApiCoreV1HttpHeader = {
  name: string;
  value: string;
};

export type UtilIntstrIntOrString = number | string;

export type K8SIoApiCoreV1UriScheme = string;

export type K8SIoApiCoreV1TcpSocketAction = {
  host?: string;
  port: UtilIntstrIntOrString;
};

export type K8SIoApiCoreV1Probe = K8SIoApiCoreV1ProbeHandler & {
  failureThreshold?: number;
  initialDelaySeconds?: number;
  periodSeconds?: number;
  successThreshold?: number;
  terminationGracePeriodSeconds?: number;
  timeoutSeconds?: number;
};

export type K8SIoApiCoreV1ProbeHandler = {
  exec?: K8SIoApiCoreV1ExecAction;
  grpc?: K8SIoApiCoreV1GrpcAction;
  httpGet?: K8SIoApiCoreV1HttpGetAction;
  tcpSocket?: K8SIoApiCoreV1TcpSocketAction;
};

export type K8SIoApiCoreV1GrpcAction = {
  port: number;
  service: string;
};

export type K8SIoApiCoreV1ResourceRequirements = {
  claims?: Array<K8SIoApiCoreV1ResourceClaim>;
  limits?: K8SIoApiCoreV1ResourceList;
  requests?: K8SIoApiCoreV1ResourceList;
};

export type K8SIoApiCoreV1ResourceClaim = {
  name: string;
};

export type K8SIoApiCoreV1ResourceList = {
  [k: K8SIoApiCoreV1ResourceName]: ApiResourceQuantity;
};

export type K8SIoApiCoreV1ResourceName = string;

export type ApiResourceQuantity = string;

export type K8SIoApiCoreV1SecurityContext = {
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
};

export type K8SIoApiCoreV1Capabilities = {
  add?: Array<K8SIoApiCoreV1Capability>;
  drop?: Array<K8SIoApiCoreV1Capability>;
};

export type K8SIoApiCoreV1Capability = string;

export type K8SIoApiCoreV1ProcMountType = string;

export type K8SIoApiCoreV1SeLinuxOptions = {
  level?: string;
  role?: string;
  type?: string;
  user?: string;
};

export type K8SIoApiCoreV1SeccompProfile = {
  localhostProfile?: string;
  type: K8SIoApiCoreV1SeccompProfileType;
};

export type K8SIoApiCoreV1SeccompProfileType = string;

export type K8SIoApiCoreV1WindowsSecurityContextOptions = {
  gmsaCredentialSpec?: string;
  gmsaCredentialSpecName?: string;
  hostProcess?: boolean;
  runAsUserName?: string;
};

export type K8SIoApiCoreV1TerminationMessagePolicy = string;

export type ApisKubepkgV1Alpha1Deploy =
  | {
      kind: "ConfigMap";
      annotations?: { [k: string]: string };
    }
  | {
      kind: "CronJob";
      annotations?: { [k: string]: string };
      spec?: K8SIoApiBatchV1CronJobSpec;
    }
  | {
      kind: "DaemonSet";
      annotations?: { [k: string]: string };
      spec?: K8SIoApiAppsV1DaemonSetSpec;
    }
  | {
      kind: "Deployment";
      annotations?: { [k: string]: string };
      spec?: K8SIoApiAppsV1DeploymentSpec;
    }
  | {
      kind: "Job";
      annotations?: { [k: string]: string };
      spec?: K8SIoApiBatchV1JobSpec;
    }
  | {
      kind: "Secret";
      annotations?: { [k: string]: string };
    }
  | {
      kind: "StatefulSet";
      annotations?: { [k: string]: string };
      spec?: K8SIoApiAppsV1StatefulSetSpec;
    };

export type K8SIoApiBatchV1CronJobSpec = {
  concurrencyPolicy?: K8SIoApiBatchV1ConcurrencyPolicy;
  failedJobsHistoryLimit?: number;
  jobTemplate: K8SIoApiBatchV1JobTemplateSpec;
  schedule: string;
  startingDeadlineSeconds?: number;
  successfulJobsHistoryLimit?: number;
  suspend?: boolean;
  timeZone?: string;
};

export type K8SIoApiBatchV1ConcurrencyPolicy = string;

export type K8SIoApiBatchV1JobTemplateSpec = {
  metadata?: ApisMetaV1ObjectMeta;
  spec?: K8SIoApiBatchV1JobSpec;
};

export type K8SIoApiBatchV1JobSpec = {
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
};

export type K8SIoApiBatchV1CompletionMode = string;

export type K8SIoApiBatchV1PodFailurePolicy = {
  rules: Array<K8SIoApiBatchV1PodFailurePolicyRule>;
};

export type K8SIoApiBatchV1PodFailurePolicyRule = {
  action: K8SIoApiBatchV1PodFailurePolicyAction;
  onExitCodes?: K8SIoApiBatchV1PodFailurePolicyOnExitCodesRequirement;
  onPodConditions: Array<K8SIoApiBatchV1PodFailurePolicyOnPodConditionsPattern>;
};

export type K8SIoApiBatchV1PodFailurePolicyAction = string;

export type K8SIoApiBatchV1PodFailurePolicyOnExitCodesRequirement = {
  containerName: string;
  operator: K8SIoApiBatchV1PodFailurePolicyOnExitCodesOperator;
  values: Array<number>;
};

export type K8SIoApiBatchV1PodFailurePolicyOnExitCodesOperator = string;

export type K8SIoApiBatchV1PodFailurePolicyOnPodConditionsPattern = {
  status: K8SIoApiCoreV1ConditionStatus;
  type: K8SIoApiCoreV1PodConditionType;
};

export type K8SIoApiCoreV1ConditionStatus = string;

export type K8SIoApiCoreV1PodConditionType = string;

export type ApisMetaV1LabelSelector = {
  matchExpressions?: Array<ApisMetaV1LabelSelectorRequirement>;
  matchLabels?: { [k: string]: string };
};

export type ApisMetaV1LabelSelectorRequirement = {
  key: string;
  operator: ApisMetaV1LabelSelectorOperator;
  values?: Array<string>;
};

export type ApisMetaV1LabelSelectorOperator = string;

export type K8SIoApiCoreV1PodTemplateSpec = {
  metadata?: ApisMetaV1ObjectMeta;
  spec?: K8SIoApiCoreV1PodSpec;
};

export type K8SIoApiCoreV1PodSpec = {
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
  nodeSelector?: { [k: string]: string };
  os?: K8SIoApiCoreV1PodOs;
  overhead?: K8SIoApiCoreV1ResourceList;
  preemptionPolicy?: K8SIoApiCoreV1PreemptionPolicy;
  priority?: number;
  priorityClassName?: string;
  readinessGates?: Array<K8SIoApiCoreV1PodReadinessGate>;
  resourceClaims?: Array<K8SIoApiCoreV1PodResourceClaim>;
  restartPolicy?: K8SIoApiCoreV1RestartPolicy;
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
};

export type K8SIoApiCoreV1Affinity = {
  nodeAffinity?: K8SIoApiCoreV1NodeAffinity;
  podAffinity?: K8SIoApiCoreV1PodAffinity;
  podAntiAffinity?: K8SIoApiCoreV1PodAntiAffinity;
};

export type K8SIoApiCoreV1NodeAffinity = {
  preferredDuringSchedulingIgnoredDuringExecution?: Array<K8SIoApiCoreV1PreferredSchedulingTerm>;
  requiredDuringSchedulingIgnoredDuringExecution?: K8SIoApiCoreV1NodeSelector;
};

export type K8SIoApiCoreV1PreferredSchedulingTerm = {
  preference: K8SIoApiCoreV1NodeSelectorTerm;
  weight: number;
};

export type K8SIoApiCoreV1NodeSelectorTerm = {
  matchExpressions?: Array<K8SIoApiCoreV1NodeSelectorRequirement>;
  matchFields?: Array<K8SIoApiCoreV1NodeSelectorRequirement>;
};

export type K8SIoApiCoreV1NodeSelectorRequirement = {
  key: string;
  operator: K8SIoApiCoreV1NodeSelectorOperator;
  values?: Array<string>;
};

export type K8SIoApiCoreV1NodeSelectorOperator = string;

export type K8SIoApiCoreV1NodeSelector = {
  nodeSelectorTerms: Array<K8SIoApiCoreV1NodeSelectorTerm>;
};

export type K8SIoApiCoreV1PodAffinity = {
  preferredDuringSchedulingIgnoredDuringExecution?: Array<K8SIoApiCoreV1WeightedPodAffinityTerm>;
  requiredDuringSchedulingIgnoredDuringExecution?: Array<K8SIoApiCoreV1PodAffinityTerm>;
};

export type K8SIoApiCoreV1WeightedPodAffinityTerm = {
  podAffinityTerm: K8SIoApiCoreV1PodAffinityTerm;
  weight: number;
};

export type K8SIoApiCoreV1PodAffinityTerm = {
  labelSelector?: ApisMetaV1LabelSelector;
  namespaceSelector?: ApisMetaV1LabelSelector;
  namespaces?: Array<string>;
  topologyKey: string;
};

export type K8SIoApiCoreV1PodAntiAffinity = {
  preferredDuringSchedulingIgnoredDuringExecution?: Array<K8SIoApiCoreV1WeightedPodAffinityTerm>;
  requiredDuringSchedulingIgnoredDuringExecution?: Array<K8SIoApiCoreV1PodAffinityTerm>;
};

export type K8SIoApiCoreV1PodDnsConfig = {
  nameservers?: Array<string>;
  options?: Array<K8SIoApiCoreV1PodDnsConfigOption>;
  searches?: Array<string>;
};

export type K8SIoApiCoreV1PodDnsConfigOption = {
  name?: string;
  value?: string;
};

export type K8SIoApiCoreV1DnsPolicy = string;

export type K8SIoApiCoreV1HostAlias = {
  hostnames?: Array<string>;
  ip?: string;
};

export type K8SIoApiCoreV1LocalObjectReference = {
  name?: string;
};

export type K8SIoApiCoreV1PodOs = {
  name: K8SIoApiCoreV1OsName;
};

export type K8SIoApiCoreV1OsName = string;

export enum K8SIoApiCoreV1PreemptionPolicy {
  Never = "Never",
  PreemptLowerPriority = "PreemptLowerPriority",
}

export type K8SIoApiCoreV1PodReadinessGate = {
  conditionType: K8SIoApiCoreV1PodConditionType;
};

export type K8SIoApiCoreV1PodResourceClaim = {
  name: string;
  source?: K8SIoApiCoreV1ClaimSource;
};

export type K8SIoApiCoreV1ClaimSource = {
  resourceClaimName?: string;
  resourceClaimTemplateName?: string;
};

export enum K8SIoApiCoreV1RestartPolicy {
  Always = "Always",
  OnFailure = "OnFailure",
  Never = "Never",
}

export type K8SIoApiCoreV1PodSchedulingGate = {
  name: string;
};

export type K8SIoApiCoreV1PodSecurityContext = {
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
};

export type K8SIoApiCoreV1PodFsGroupChangePolicy = string;

export type K8SIoApiCoreV1Sysctl = {
  name: string;
  value: string;
};

export type K8SIoApiCoreV1Toleration = {
  effect?: K8SIoApiCoreV1TaintEffect;
  key?: string;
  operator?: K8SIoApiCoreV1TolerationOperator;
  tolerationSeconds?: number;
  value?: string;
};

export type K8SIoApiCoreV1TaintEffect = string;

export type K8SIoApiCoreV1TolerationOperator = string;

export type K8SIoApiCoreV1TopologySpreadConstraint = {
  labelSelector?: ApisMetaV1LabelSelector;
  matchLabelKeys?: Array<string>;
  maxSkew: number;
  minDomains?: number;
  nodeAffinityPolicy?: K8SIoApiCoreV1NodeInclusionPolicy;
  nodeTaintsPolicy?: K8SIoApiCoreV1NodeInclusionPolicy;
  topologyKey: string;
  whenUnsatisfiable: K8SIoApiCoreV1UnsatisfiableConstraintAction;
};

export type K8SIoApiCoreV1NodeInclusionPolicy = string;

export type K8SIoApiCoreV1UnsatisfiableConstraintAction = string;

export type K8SIoApiAppsV1DaemonSetSpec = {
  minReadySeconds?: number;
  revisionHistoryLimit?: number;
  selector?: ApisMetaV1LabelSelector;
  template: K8SIoApiCoreV1PodTemplateSpec;
  updateStrategy?: K8SIoApiAppsV1DaemonSetUpdateStrategy;
};

export type K8SIoApiAppsV1DaemonSetUpdateStrategy = {
  rollingUpdate?: K8SIoApiAppsV1RollingUpdateDaemonSet;
  type?: K8SIoApiAppsV1DaemonSetUpdateStrategyType;
};

export type K8SIoApiAppsV1RollingUpdateDaemonSet = {
  maxSurge?: UtilIntstrIntOrString;
  maxUnavailable?: UtilIntstrIntOrString;
};

export enum K8SIoApiAppsV1DaemonSetUpdateStrategyType {
  RollingUpdate = "RollingUpdate",
  OnDelete = "OnDelete",
}

export type K8SIoApiAppsV1DeploymentSpec = {
  minReadySeconds?: number;
  paused?: boolean;
  progressDeadlineSeconds?: number;
  replicas?: number;
  revisionHistoryLimit?: number;
  selector?: ApisMetaV1LabelSelector;
  strategy?: K8SIoApiAppsV1DeploymentStrategy;
  template: K8SIoApiCoreV1PodTemplateSpec;
};

export type K8SIoApiAppsV1DeploymentStrategy = {
  rollingUpdate?: K8SIoApiAppsV1RollingUpdateDeployment;
  type?: K8SIoApiAppsV1DeploymentStrategyType;
};

export type K8SIoApiAppsV1RollingUpdateDeployment = {
  maxSurge?: UtilIntstrIntOrString;
  maxUnavailable?: UtilIntstrIntOrString;
};

export enum K8SIoApiAppsV1DeploymentStrategyType {
  Recreate = "Recreate",
  RollingUpdate = "RollingUpdate",
}

export type K8SIoApiAppsV1StatefulSetSpec = {
  minReadySeconds?: number;
  ordinals?: K8SIoApiAppsV1StatefulSetOrdinals;
  persistentVolumeClaimRetentionPolicy?: K8SIoApiAppsV1StatefulSetPersistentVolumeClaimRetentionPolicy;
  podManagementPolicy?: K8SIoApiAppsV1PodManagementPolicyType;
  replicas?: number;
  revisionHistoryLimit?: number;
  selector?: ApisMetaV1LabelSelector;
  serviceName: string;
  template: K8SIoApiCoreV1PodTemplateSpec;
  updateStrategy?: K8SIoApiAppsV1StatefulSetUpdateStrategy;
  volumeClaimTemplates?: Array<K8SIoApiCoreV1PersistentVolumeClaim>;
};

export type K8SIoApiAppsV1StatefulSetOrdinals = {
  start: number;
};

export type K8SIoApiAppsV1StatefulSetPersistentVolumeClaimRetentionPolicy = {
  whenDeleted?: K8SIoApiAppsV1PersistentVolumeClaimRetentionPolicyType;
  whenScaled?: K8SIoApiAppsV1PersistentVolumeClaimRetentionPolicyType;
};

export type K8SIoApiAppsV1PersistentVolumeClaimRetentionPolicyType = string;

export type K8SIoApiAppsV1PodManagementPolicyType = string;

export type K8SIoApiAppsV1StatefulSetUpdateStrategy = {
  rollingUpdate?: K8SIoApiAppsV1RollingUpdateStatefulSetStrategy;
  type?: K8SIoApiAppsV1StatefulSetUpdateStrategyType;
};

export type K8SIoApiAppsV1RollingUpdateStatefulSetStrategy = {
  maxUnavailable?: UtilIntstrIntOrString;
  partition?: number;
};

export type K8SIoApiAppsV1StatefulSetUpdateStrategyType = string;

export type K8SIoApiCoreV1PersistentVolumeClaim = ApisMetaV1TypeMeta & {
  metadata?: ApisMetaV1ObjectMeta;
  spec?: K8SIoApiCoreV1PersistentVolumeClaimSpec;
  status?: K8SIoApiCoreV1PersistentVolumeClaimStatus;
};

export type K8SIoApiCoreV1PersistentVolumeClaimSpec = {
  accessModes?: Array<K8SIoApiCoreV1PersistentVolumeAccessMode>;
  dataSource?: K8SIoApiCoreV1TypedLocalObjectReference;
  dataSourceRef?: K8SIoApiCoreV1TypedObjectReference;
  resources?: K8SIoApiCoreV1ResourceRequirements;
  selector?: ApisMetaV1LabelSelector;
  storageClassName?: string;
  volumeMode?: K8SIoApiCoreV1PersistentVolumeMode;
  volumeName?: string;
};

export type K8SIoApiCoreV1PersistentVolumeAccessMode = string;

export type K8SIoApiCoreV1TypedLocalObjectReference = {
  apiGroup: string;
  kind: string;
  name: string;
};

export type K8SIoApiCoreV1TypedObjectReference = {
  apiGroup: string;
  kind: string;
  name: string;
  namespace?: string;
};

export type K8SIoApiCoreV1PersistentVolumeMode = string;

export type K8SIoApiCoreV1PersistentVolumeClaimStatus = {
  accessModes?: Array<K8SIoApiCoreV1PersistentVolumeAccessMode>;
  allocatedResources?: K8SIoApiCoreV1ResourceList;
  capacity?: K8SIoApiCoreV1ResourceList;
  conditions?: Array<K8SIoApiCoreV1PersistentVolumeClaimCondition>;
  phase?: K8SIoApiCoreV1PersistentVolumeClaimPhase;
  resizeStatus?: K8SIoApiCoreV1PersistentVolumeClaimResizeStatus;
};

export type K8SIoApiCoreV1PersistentVolumeClaimCondition = {
  lastProbeTime?: ApisMetaV1Time;
  lastTransitionTime?: ApisMetaV1Time;
  message?: string;
  reason?: string;
  status: K8SIoApiCoreV1ConditionStatus;
  type: K8SIoApiCoreV1PersistentVolumeClaimConditionType;
};

export type ApisMetaV1Time = string;

export type K8SIoApiCoreV1PersistentVolumeClaimConditionType = string;

export type K8SIoApiCoreV1PersistentVolumeClaimPhase = string;

export type K8SIoApiCoreV1PersistentVolumeClaimResizeStatus = string;

export type ApisKubepkgV1Alpha1Manifests = { [k: string]: any };

export type ApisKubepkgV1Alpha1ServiceAccount = {
  rules: Array<K8SIoApiRbacV1PolicyRule>;
  scope?: ApisKubepkgV1Alpha1ScopeType;
};

export type K8SIoApiRbacV1PolicyRule = {
  apiGroups?: Array<string>;
  nonResourceURLs?: Array<string>;
  resourceNames?: Array<string>;
  resources?: Array<string>;
  verbs: Array<string>;
};

export enum ApisKubepkgV1Alpha1ScopeType {
  Cluster = "Cluster",
  Namespace = "Namespace",
}

export type ApisKubepkgV1Alpha1Service = {
  clusterIP?: string;
  expose?: ApisKubepkgV1Alpha1Expose;
  paths?: { [k: string]: string };
  ports?: { [k: string]: number };
};

export type ApisKubepkgV1Alpha1Expose = {
  gateway?: Array<string>;
  type: string;
};

export type ApisKubepkgV1Alpha1Volume =
  | {
      type: "ConfigMap";
      mountPath: string;
      mountPropagation?: "Bidirectional" | "HostToContainer";
      optional?: boolean;
      prefix?: string;
      readOnly?: boolean;
      subPath?: string;
      opt?: K8SIoApiCoreV1ConfigMapVolumeSource;
      spec?: ApisKubepkgV1Alpha1SpecData;
    }
  | {
      type: "EmptyDir";
      mountPath: string;
      mountPropagation?: "Bidirectional" | "HostToContainer";
      optional?: boolean;
      prefix?: string;
      readOnly?: boolean;
      subPath?: string;
      opt?: K8SIoApiCoreV1EmptyDirVolumeSource;
    }
  | {
      type: "HostPath";
      mountPath: string;
      mountPropagation?: "Bidirectional" | "HostToContainer";
      optional?: boolean;
      prefix?: string;
      readOnly?: boolean;
      subPath?: string;
      opt?: K8SIoApiCoreV1HostPathVolumeSource;
    }
  | {
      type: "PersistentVolumeClaim";
      mountPath: string;
      mountPropagation?: "Bidirectional" | "HostToContainer";
      optional?: boolean;
      prefix?: string;
      readOnly?: boolean;
      subPath?: string;
      opt?: K8SIoApiCoreV1PersistentVolumeClaimVolumeSource;
      spec: K8SIoApiCoreV1PersistentVolumeClaimSpec;
    }
  | {
      type: "Secret";
      mountPath: string;
      mountPropagation?: "Bidirectional" | "HostToContainer";
      optional?: boolean;
      prefix?: string;
      readOnly?: boolean;
      subPath?: string;
      opt?: K8SIoApiCoreV1SecretVolumeSource;
      spec?: ApisKubepkgV1Alpha1SpecData;
    };

export type K8SIoApiCoreV1ConfigMapVolumeSource =
  K8SIoApiCoreV1LocalObjectReference & {
    defaultMode?: number;
    items?: Array<K8SIoApiCoreV1KeyToPath>;
    optional?: boolean;
  };

export type K8SIoApiCoreV1KeyToPath = {
  key: string;
  mode?: number;
  path: string;
};

export type ApisKubepkgV1Alpha1SpecData = {
  data: { [k: string]: string };
};

export type K8SIoApiCoreV1EmptyDirVolumeSource = {
  medium?: K8SIoApiCoreV1StorageMedium;
  sizeLimit?: ApiResourceQuantity;
};

export type K8SIoApiCoreV1StorageMedium = string;

export type K8SIoApiCoreV1HostPathVolumeSource = {
  path: string;
  type?: K8SIoApiCoreV1HostPathType;
};

export type K8SIoApiCoreV1HostPathType = string;

export type K8SIoApiCoreV1PersistentVolumeClaimVolumeSource = {
  claimName: string;
  readOnly?: boolean;
};

export type K8SIoApiCoreV1SecretVolumeSource = {
  defaultMode?: number;
  items?: Array<K8SIoApiCoreV1KeyToPath>;
  optional?: boolean;
  secretName?: string;
};

export type ApisKubepkgV1Alpha1Status = {
  digests?: Array<ApisKubepkgV1Alpha1DigestMeta>;
  endpoint?: { [k: string]: string };
  images?: { [k: string]: string };
  resources?: Array<{ [k: string]: any }>;
};

export type ApisKubepkgV1Alpha1DigestMeta = {
  digest: string;
  name: string;
  platform?: string;
  size: ApisKubepkgV1Alpha1FileSize;
  tag?: string;
  type: ApisKubepkgV1Alpha1DigestMetaType;
};

export type ApisKubepkgV1Alpha1FileSize = number;

export enum ApisKubepkgV1Alpha1DigestMetaType {
  blob = "blob",
  manifest = "manifest",
}

export type ApisKubepkgV1Alpha1KubePkgList = ApisMetaV1TypeMeta & {
  items: Array<ApisKubepkgV1Alpha1KubePkg>;
  metadata?: ApisMetaV1ListMeta;
};

export type ApisMetaV1ListMeta = {
  continue?: string;
  remainingItemCount?: number;
  resourceVersion?: string;
  selfLink?: string;
};

export type GroupDeploymentId = string;

export type Kubepkg = DatatypesCreationUpdationDeletionTime & {
  group: string;
  kubepkgID: KubepkgId;
  name: string;
};

export type KubepkgId = string;

export enum KubepkgChannel {
  DEV = "DEV",
  BETA = "BETA",
  RC = "RC",
  STABLE = "STABLE",
}

export const displayKubepkgChannel = (v: KubepkgChannel) => {
  return (
    {
      DEV: "开发",
      BETA: "测试",
      RC: "预览",
      STABLE: "正式",
    }[v] ?? v
  );
};

export type KubepkgRevisionId = string;

export type KubepkgVersionInfo = {
  revisionID: KubepkgRevisionId;
  version: string;
};

export type GroupRobotDataList = {
  data: Array<GroupRobot>;
  total: number;
};

export type GroupRobot = GroupAccount & AccountRobotInfo & {};

export type AccountRobotInfo = {
  name: string;
};

export type AccountRobot = Account & AccountRobotInfo & {};

export type GroupRefreshGroupRobotTokenData = GroupRoleInfo & {
  expiresIn: number;
};

export type AuthOperatorAccount = AccountUser & {
  accountType: AccountType;
  adminRole: GroupRoleType;
  groupRoles?: { [k: GroupId]: GroupRoleType };
};

export type RbacPermissions = { [k: string]: Array<any> };

export const AccountIdSchema = /*#__PURE__*/ t.string();

export const AccountUserDataListSchema = /*#__PURE__*/ t.object({
  data: t.array(t.ref("AccountUser", () => AccountUserSchema)),
  total: t.integer(),
});

export const AccountUserSchema = /*#__PURE__*/ t.intersection(
  t.ref("Account", () => AccountSchema),
  t.ref("AccountUserInfo", () => AccountUserInfoSchema),
  t.object(),
);

export const AccountSchema = /*#__PURE__*/ t.intersection(
  t.ref("DatatypesPrimaryId", () => DatatypesPrimaryIdSchema),
  t.ref(
    "DatatypesCreationUpdationDeletionTime",
    () => DatatypesCreationUpdationDeletionTimeSchema,
  ),
  t.object({
    accountID: t.ref("AccountId", () => AccountIdSchema),
    accountType: t.ref("AccountType", () => AccountTypeSchema),
  }),
);

export const DatatypesPrimaryIdSchema = /*#__PURE__*/ t.object();

export const DatatypesCreationUpdationDeletionTimeSchema =
  /*#__PURE__*/ t.intersection(
    t.ref(
      "DatatypesCreationUpdationTime",
      () => DatatypesCreationUpdationTimeSchema,
    ),
    t.object({
      deletedAt: t
        .ref("DatatypesTimestamp", () => DatatypesTimestampSchema)
        .optional(),
    }),
  );

export const DatatypesCreationUpdationTimeSchema = /*#__PURE__*/ t.intersection(
  t.ref("DatatypesCreationTime", () => DatatypesCreationTimeSchema),
  t.object({
    updatedAt: t.ref("DatatypesTimestamp", () => DatatypesTimestampSchema),
  }),
);

export const DatatypesCreationTimeSchema = /*#__PURE__*/ t.object({
  createdAt: t.ref("DatatypesTimestamp", () => DatatypesTimestampSchema),
});

export const DatatypesTimestampSchema = /*#__PURE__*/ t.string();

export const AccountTypeSchema = /*#__PURE__*/ t.nativeEnum(AccountType);

export const AccountUserInfoSchema = /*#__PURE__*/ t.object({
  email: t.string().optional(),
  mobile: t.string().optional(),
  nickname: t.string().optional(),
});

export const GroupRoleTypeSchema = /*#__PURE__*/ t.nativeEnum(GroupRoleType);

export const GroupUserDataListSchema = /*#__PURE__*/ t.object({
  data: t.array(t.ref("GroupUser", () => GroupUserSchema)),
  total: t.integer(),
});

export const GroupUserSchema = /*#__PURE__*/ t.intersection(
  t.ref("GroupAccount", () => GroupAccountSchema),
  t.ref("AccountUserInfo", () => AccountUserInfoSchema),
  t.object(),
);

export const GroupAccountSchema = /*#__PURE__*/ t.intersection(
  t.ref(
    "DatatypesCreationUpdationTime",
    () => DatatypesCreationUpdationTimeSchema,
  ),
  t.object({
    accountID: t
      .ref("AccountId", () => AccountIdSchema)
      .annotate({ description: "账户 ID" }),
    groupID: t
      .ref("GroupId", () => GroupIdSchema)
      .annotate({ description: "组织 ID" }),
    roleType: t
      .ref("GroupRoleType", () => GroupRoleTypeSchema)
      .annotate({ description: "角色" }),
  }),
);

export const GroupIdSchema = /*#__PURE__*/ t.string();

export const GroupRoleInfoSchema = /*#__PURE__*/ t.object({
  roleType: t.ref("GroupRoleType", () => GroupRoleTypeSchema),
});

export const AuthProviderInfoSchema = /*#__PURE__*/ t.object({
  name: t.string(),
  type: t.string(),
});

export const AuthExchangeTokenDataSchema = /*#__PURE__*/ t.object({
  code: t.string(),
});

export const AuthTokenSchema = /*#__PURE__*/ t.object({
  access_token: t.string(),
  expires_in: t.integer(),
  id: t.string().annotate({ description: "ext" }).optional(),
  issued_at: t.ref("Time", () => TimeSchema),
  refresh_token: t.string().optional(),
  token: t.string().optional(),
  type: t.string().annotate({ description: "Token type" }),
});

export const TimeSchema = /*#__PURE__*/ t.string();

export const AgentSchema = /*#__PURE__*/ t.object({
  endpoint: t.string(),
  labels: t.record(t.string(), t.string()).optional(),
  name: t.string(),
  otpKeyURL: t.string().optional(),
  time: t.ref("DatatypesDatetime", () => DatatypesDatetimeSchema).optional(),
  token: t.string().optional(),
});

export const DatatypesDatetimeSchema = /*#__PURE__*/ t.string();

export const ClusterSchema = /*#__PURE__*/ t.intersection(
  t.ref("ClusterInfo", () => ClusterInfoSchema),
  t.ref(
    "DatatypesCreationUpdationDeletionTime",
    () => DatatypesCreationUpdationDeletionTimeSchema,
  ),
  t.object({
    agentInfo: t
      .ref("ClusterAgentInfo", () => ClusterAgentInfoSchema)
      .optional(),
    clusterID: t
      .ref("ClusterId", () => ClusterIdSchema)
      .annotate({ description: "集群 ID" }),
    name: t.string().annotate({ description: "集群名称" }),
    netType: t
      .ref("ClusterNetType", () => ClusterNetTypeSchema)
      .annotate({ description: "网络环境" }),
  }),
);

export const ClusterInfoSchema = /*#__PURE__*/ t.object({
  desc: t.string().annotate({ description: "集群描述" }).optional(),
  envType: t
    .ref("ClusterEnvType", () => ClusterEnvTypeSchema)
    .annotate({ description: "集群环境类型" }),
});

export const ClusterEnvTypeSchema = /*#__PURE__*/ t.nativeEnum(ClusterEnvType);

export const ClusterAgentInfoSchema = /*#__PURE__*/ t.object({
  endpoint: t.string().optional(),
  labels: t.record(t.string(), t.string()).optional(),
});

export const ClusterIdSchema = /*#__PURE__*/ t.string();

export const ClusterNetTypeSchema = /*#__PURE__*/ t.nativeEnum(ClusterNetType);

export const ClientObjectSchema = /*#__PURE__*/ t.any();

export const ClusterInstanceStatusSchema = /*#__PURE__*/ t.intersection(
  t.ref(
    "KubeutilClusterinfoClusterInfo",
    () => KubeutilClusterinfoClusterInfoSchema,
  ),
  t.object({
    ping: t.ref("StrfmtDuration", () => StrfmtDurationSchema).optional(),
  }),
);

export const KubeutilClusterinfoClusterInfoSchema = /*#__PURE__*/ t.object({
  nodes: t.array(
    t.ref(
      "KubeutilClusterinfoClusterNode",
      () => KubeutilClusterinfoClusterNodeSchema,
    ),
  ),
});

export const KubeutilClusterinfoClusterNodeSchema =
  /*#__PURE__*/ t.intersection(
    t.ref(
      "K8SIoApiCoreV1NodeSystemInfo",
      () => K8SIoApiCoreV1NodeSystemInfoSchema,
    ),
    t.object({
      externalIP: t.string(),
      hostname: t.string(),
      internalIP: t.string(),
      role: t.string(),
    }),
  );

export const K8SIoApiCoreV1NodeSystemInfoSchema = /*#__PURE__*/ t.object({
  architecture: t.string(),
  bootID: t.string(),
  containerRuntimeVersion: t.string(),
  kernelVersion: t.string(),
  kubeProxyVersion: t.string(),
  kubeletVersion: t.string(),
  machineID: t.string(),
  operatingSystem: t.string(),
  osImage: t.string(),
  systemUUID: t.string(),
});

export const StrfmtDurationSchema = /*#__PURE__*/ t.string();

export const GroupSchema = /*#__PURE__*/ t.intersection(
  t.ref("GroupInfo", () => GroupInfoSchema),
  t.ref(
    "DatatypesCreationUpdationDeletionTime",
    () => DatatypesCreationUpdationDeletionTimeSchema,
  ),
  t.object({
    groupID: t
      .ref("GroupId", () => GroupIdSchema)
      .annotate({ description: "组织 ID" }),
    name: t.string().annotate({ description: "组织名称" }),
  }),
);

export const GroupInfoSchema = /*#__PURE__*/ t.object({
  desc: t.string().annotate({ description: "组织描述" }).optional(),
  type: t
    .ref("GroupType", () => GroupTypeSchema)
    .annotate({ description: "组织类型" }),
});

export const GroupTypeSchema = /*#__PURE__*/ t.nativeEnum(GroupType);

export const GroupEnvWithClusterSchema = /*#__PURE__*/ t.intersection(
  t.ref("GroupEnv", () => GroupEnvSchema),
  t.object({
    cluster: t.ref("Cluster", () => ClusterSchema).optional(),
  }),
);

export const GroupEnvSchema = /*#__PURE__*/ t.intersection(
  t.ref("GroupEnvInfo", () => GroupEnvInfoSchema),
  t.ref("GroupEnvCluster", () => GroupEnvClusterSchema),
  t.ref(
    "DatatypesCreationUpdationDeletionTime",
    () => DatatypesCreationUpdationDeletionTimeSchema,
  ),
  t.object({
    envID: t.ref("GroupEnvId", () => GroupEnvIdSchema),
    envName: t.string(),
    groupID: t
      .ref("GroupId", () => GroupIdSchema)
      .annotate({ description: "组织 ID" }),
  }),
);

export const GroupEnvInfoSchema = /*#__PURE__*/ t.object({
  desc: t.string().annotate({ description: "环境描述" }),
  envType: t
    .ref("GroupEnvType", () => GroupEnvTypeSchema)
    .annotate({ description: "环境类型" }),
});

export const GroupEnvTypeSchema = /*#__PURE__*/ t.nativeEnum(GroupEnvType);

export const GroupEnvClusterSchema = /*#__PURE__*/ t.object({
  namespace: t.string().annotate({ description: "对应 namespace" }),
});

export const GroupEnvIdSchema = /*#__PURE__*/ t.string();

export const ApisKubepkgV1Alpha1KubePkgSchema = /*#__PURE__*/ t.intersection(
  t.ref("ApisMetaV1TypeMeta", () => ApisMetaV1TypeMetaSchema),
  t.object({
    metadata: t
      .ref("ApisMetaV1ObjectMeta", () => ApisMetaV1ObjectMetaSchema)
      .optional(),
    spec: t.ref("ApisKubepkgV1Alpha1Spec", () => ApisKubepkgV1Alpha1SpecSchema),
    status: t
      .ref("ApisKubepkgV1Alpha1Status", () => ApisKubepkgV1Alpha1StatusSchema)
      .optional(),
  }),
);

export const ApisMetaV1TypeMetaSchema = /*#__PURE__*/ t.object({
  apiVersion: t.string().optional(),
  kind: t.string().optional(),
});

export const ApisMetaV1ObjectMetaSchema = /*#__PURE__*/ t.object({
  annotations: t.record(t.string(), t.string()).optional(),
  labels: t.record(t.string(), t.string()).optional(),
  name: t.string().optional(),
  namespace: t.string().optional(),
});

export const ApisKubepkgV1Alpha1SpecSchema = /*#__PURE__*/ t.object({
  config: t
    .record(
      t.string(),
      t.ref(
        "ApisKubepkgV1Alpha1EnvVarValueOrFrom",
        () => ApisKubepkgV1Alpha1EnvVarValueOrFromSchema,
      ),
    )
    .optional(),
  containers: t
    .record(
      t.string(),
      t.ref(
        "ApisKubepkgV1Alpha1Container",
        () => ApisKubepkgV1Alpha1ContainerSchema,
      ),
    )
    .optional(),
  deploy: t
    .ref("ApisKubepkgV1Alpha1Deploy", () => ApisKubepkgV1Alpha1DeploySchema)
    .optional(),
  manifests: t
    .ref(
      "ApisKubepkgV1Alpha1Manifests",
      () => ApisKubepkgV1Alpha1ManifestsSchema,
    )
    .optional(),
  serviceAccount: t
    .ref(
      "ApisKubepkgV1Alpha1ServiceAccount",
      () => ApisKubepkgV1Alpha1ServiceAccountSchema,
    )
    .optional(),
  services: t
    .record(
      t.string(),
      t.ref(
        "ApisKubepkgV1Alpha1Service",
        () => ApisKubepkgV1Alpha1ServiceSchema,
      ),
    )
    .optional(),
  version: t.string(),
  volumes: t
    .record(
      t.string(),
      t.ref("ApisKubepkgV1Alpha1Volume", () => ApisKubepkgV1Alpha1VolumeSchema),
    )
    .optional(),
});

export const ApisKubepkgV1Alpha1EnvVarValueOrFromSchema =
  /*#__PURE__*/ t.string();

export const ApisKubepkgV1Alpha1ContainerSchema = /*#__PURE__*/ t.object({
  args: t.array(t.string()).optional(),
  command: t.array(t.string()).optional(),
  env: t
    .record(
      t.string(),
      t.ref(
        "ApisKubepkgV1Alpha1EnvVarValueOrFrom",
        () => ApisKubepkgV1Alpha1EnvVarValueOrFromSchema,
      ),
    )
    .optional(),
  image: t.ref(
    "ApisKubepkgV1Alpha1Image",
    () => ApisKubepkgV1Alpha1ImageSchema,
  ),
  lifecycle: t
    .ref("K8SIoApiCoreV1Lifecycle", () => K8SIoApiCoreV1LifecycleSchema)
    .optional(),
  livenessProbe: t
    .ref("K8SIoApiCoreV1Probe", () => K8SIoApiCoreV1ProbeSchema)
    .optional(),
  ports: t
    .record(t.string(), t.integer())
    .annotate({ description: "Ports: [PortName]: ContainerPort" })
    .optional(),
  readinessProbe: t
    .ref("K8SIoApiCoreV1Probe", () => K8SIoApiCoreV1ProbeSchema)
    .optional(),
  resources: t
    .ref(
      "K8SIoApiCoreV1ResourceRequirements",
      () => K8SIoApiCoreV1ResourceRequirementsSchema,
    )
    .optional(),
  securityContext: t
    .ref(
      "K8SIoApiCoreV1SecurityContext",
      () => K8SIoApiCoreV1SecurityContextSchema,
    )
    .optional(),
  startupProbe: t
    .ref("K8SIoApiCoreV1Probe", () => K8SIoApiCoreV1ProbeSchema)
    .optional(),
  stdin: t.boolean().optional(),
  stdinOnce: t.boolean().optional(),
  terminationMessagePath: t.string().optional(),
  terminationMessagePolicy: t
    .ref(
      "K8SIoApiCoreV1TerminationMessagePolicy",
      () => K8SIoApiCoreV1TerminationMessagePolicySchema,
    )
    .optional(),
  tty: t.boolean().optional(),
  workingDir: t.string().optional(),
});

export const ApisKubepkgV1Alpha1ImageSchema = /*#__PURE__*/ t.object({
  digest: t.string().optional(),
  name: t.string(),
  platforms: t.array(t.string()).optional(),
  pullPolicy: t
    .ref("K8SIoApiCoreV1PullPolicy", () => K8SIoApiCoreV1PullPolicySchema)
    .optional(),
  tag: t.string().optional(),
});

export const K8SIoApiCoreV1PullPolicySchema = /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1LifecycleSchema = /*#__PURE__*/ t.object({
  postStart: t
    .ref(
      "K8SIoApiCoreV1LifecycleHandler",
      () => K8SIoApiCoreV1LifecycleHandlerSchema,
    )
    .optional(),
  preStop: t
    .ref(
      "K8SIoApiCoreV1LifecycleHandler",
      () => K8SIoApiCoreV1LifecycleHandlerSchema,
    )
    .optional(),
});

export const K8SIoApiCoreV1LifecycleHandlerSchema = /*#__PURE__*/ t.object({
  exec: t
    .ref("K8SIoApiCoreV1ExecAction", () => K8SIoApiCoreV1ExecActionSchema)
    .optional(),
  httpGet: t
    .ref("K8SIoApiCoreV1HttpGetAction", () => K8SIoApiCoreV1HttpGetActionSchema)
    .optional(),
  tcpSocket: t
    .ref(
      "K8SIoApiCoreV1TcpSocketAction",
      () => K8SIoApiCoreV1TcpSocketActionSchema,
    )
    .optional(),
});

export const K8SIoApiCoreV1ExecActionSchema = /*#__PURE__*/ t.object({
  command: t.array(t.string()).optional(),
});

export const K8SIoApiCoreV1HttpGetActionSchema = /*#__PURE__*/ t.object({
  host: t.string().optional(),
  httpHeaders: t
    .array(
      t.ref("K8SIoApiCoreV1HttpHeader", () => K8SIoApiCoreV1HttpHeaderSchema),
    )
    .optional(),
  path: t.string().optional(),
  port: t
    .ref("UtilIntstrIntOrString", () => UtilIntstrIntOrStringSchema)
    .annotate({
      description:
        "Name or number of the port to access on the container. Number must be in the range 1 to 65535. Name must be an IANA_SVC_NAME.",
    }),
  scheme: t
    .ref("K8SIoApiCoreV1UriScheme", () => K8SIoApiCoreV1UriSchemeSchema)
    .annotate({
      description:
        "Scheme to use for connecting to the host. Defaults to HTTP.",
    })
    .optional(),
});

export const K8SIoApiCoreV1HttpHeaderSchema = /*#__PURE__*/ t.object({
  name: t.string(),
  value: t.string(),
});

export const UtilIntstrIntOrStringSchema = /*#__PURE__*/ t.union(
  t.integer(),
  t.string(),
);

export const K8SIoApiCoreV1UriSchemeSchema = /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1TcpSocketActionSchema = /*#__PURE__*/ t.object({
  host: t.string().optional(),
  port: t
    .ref("UtilIntstrIntOrString", () => UtilIntstrIntOrStringSchema)
    .annotate({
      description:
        "Number or name of the port to access on the container. Number must be in the range 1 to 65535. Name must be an IANA_SVC_NAME.",
    }),
});

export const K8SIoApiCoreV1ProbeSchema = /*#__PURE__*/ t.intersection(
  t.ref("K8SIoApiCoreV1ProbeHandler", () => K8SIoApiCoreV1ProbeHandlerSchema),
  t.object({
    failureThreshold: t.integer().optional(),
    initialDelaySeconds: t.integer().optional(),
    periodSeconds: t.integer().optional(),
    successThreshold: t.integer().optional(),
    terminationGracePeriodSeconds: t.integer().optional(),
    timeoutSeconds: t.integer().optional(),
  }),
);

export const K8SIoApiCoreV1ProbeHandlerSchema = /*#__PURE__*/ t.object({
  exec: t
    .ref("K8SIoApiCoreV1ExecAction", () => K8SIoApiCoreV1ExecActionSchema)
    .optional(),
  grpc: t
    .ref("K8SIoApiCoreV1GrpcAction", () => K8SIoApiCoreV1GrpcActionSchema)
    .optional(),
  httpGet: t
    .ref("K8SIoApiCoreV1HttpGetAction", () => K8SIoApiCoreV1HttpGetActionSchema)
    .optional(),
  tcpSocket: t
    .ref(
      "K8SIoApiCoreV1TcpSocketAction",
      () => K8SIoApiCoreV1TcpSocketActionSchema,
    )
    .optional(),
});

export const K8SIoApiCoreV1GrpcActionSchema = /*#__PURE__*/ t.object({
  port: t.integer(),
  service: t.string(),
});

export const K8SIoApiCoreV1ResourceRequirementsSchema = /*#__PURE__*/ t.object({
  claims: t
    .array(
      t.ref(
        "K8SIoApiCoreV1ResourceClaim",
        () => K8SIoApiCoreV1ResourceClaimSchema,
      ),
    )
    .optional(),
  limits: t
    .ref("K8SIoApiCoreV1ResourceList", () => K8SIoApiCoreV1ResourceListSchema)
    .annotate({
      description:
        "Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/",
    })
    .optional(),
  requests: t
    .ref("K8SIoApiCoreV1ResourceList", () => K8SIoApiCoreV1ResourceListSchema)
    .annotate({
      description:
        "Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/",
    })
    .optional(),
});

export const K8SIoApiCoreV1ResourceClaimSchema = /*#__PURE__*/ t.object({
  name: t.string(),
});

export const K8SIoApiCoreV1ResourceListSchema = /*#__PURE__*/ t.record(
  t.ref("K8SIoApiCoreV1ResourceName", () => K8SIoApiCoreV1ResourceNameSchema),
  t.ref("ApiResourceQuantity", () => ApiResourceQuantitySchema),
);

export const K8SIoApiCoreV1ResourceNameSchema = /*#__PURE__*/ t.string();

export const ApiResourceQuantitySchema = /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1SecurityContextSchema = /*#__PURE__*/ t.object({
  allowPrivilegeEscalation: t.boolean().optional(),
  capabilities: t
    .ref("K8SIoApiCoreV1Capabilities", () => K8SIoApiCoreV1CapabilitiesSchema)
    .optional(),
  privileged: t.boolean().optional(),
  procMount: t
    .ref("K8SIoApiCoreV1ProcMountType", () => K8SIoApiCoreV1ProcMountTypeSchema)
    .optional(),
  readOnlyRootFilesystem: t.boolean().optional(),
  runAsGroup: t.integer().optional(),
  runAsNonRoot: t.boolean().optional(),
  runAsUser: t.integer().optional(),
  seLinuxOptions: t
    .ref(
      "K8SIoApiCoreV1SeLinuxOptions",
      () => K8SIoApiCoreV1SeLinuxOptionsSchema,
    )
    .optional(),
  seccompProfile: t
    .ref(
      "K8SIoApiCoreV1SeccompProfile",
      () => K8SIoApiCoreV1SeccompProfileSchema,
    )
    .optional(),
  windowsOptions: t
    .ref(
      "K8SIoApiCoreV1WindowsSecurityContextOptions",
      () => K8SIoApiCoreV1WindowsSecurityContextOptionsSchema,
    )
    .optional(),
});

export const K8SIoApiCoreV1CapabilitiesSchema = /*#__PURE__*/ t.object({
  add: t
    .array(
      t.ref("K8SIoApiCoreV1Capability", () => K8SIoApiCoreV1CapabilitySchema),
    )
    .optional(),
  drop: t
    .array(
      t.ref("K8SIoApiCoreV1Capability", () => K8SIoApiCoreV1CapabilitySchema),
    )
    .optional(),
});

export const K8SIoApiCoreV1CapabilitySchema = /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1ProcMountTypeSchema = /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1SeLinuxOptionsSchema = /*#__PURE__*/ t.object({
  level: t.string().optional(),
  role: t.string().optional(),
  type: t.string().optional(),
  user: t.string().optional(),
});

export const K8SIoApiCoreV1SeccompProfileSchema = /*#__PURE__*/ t.object({
  localhostProfile: t.string().optional(),
  type: t
    .ref(
      "K8SIoApiCoreV1SeccompProfileType",
      () => K8SIoApiCoreV1SeccompProfileTypeSchema,
    )
    .annotate({
      description:
        "type indicates which kind of seccomp profile will be applied. Valid options are:",
    }),
});

export const K8SIoApiCoreV1SeccompProfileTypeSchema = /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1WindowsSecurityContextOptionsSchema =
  /*#__PURE__*/ t.object({
    gmsaCredentialSpec: t.string().optional(),
    gmsaCredentialSpecName: t.string().optional(),
    hostProcess: t.boolean().optional(),
    runAsUserName: t.string().optional(),
  });

export const K8SIoApiCoreV1TerminationMessagePolicySchema =
  /*#__PURE__*/ t.string();

export const ApisKubepkgV1Alpha1DeploySchema =
  /*#__PURE__*/ t.discriminatorMapping("kind", {
    ConfigMap: t.object({
      annotations: t.record(t.string(), t.string()).optional(),
    }),
    CronJob: t.object({
      annotations: t.record(t.string(), t.string()).optional(),
      spec: t
        .ref(
          "K8SIoApiBatchV1CronJobSpec",
          () => K8SIoApiBatchV1CronJobSpecSchema,
        )
        .optional(),
    }),
    DaemonSet: t.object({
      annotations: t.record(t.string(), t.string()).optional(),
      spec: t
        .ref(
          "K8SIoApiAppsV1DaemonSetSpec",
          () => K8SIoApiAppsV1DaemonSetSpecSchema,
        )
        .optional(),
    }),
    Deployment: t.object({
      annotations: t.record(t.string(), t.string()).optional(),
      spec: t
        .ref(
          "K8SIoApiAppsV1DeploymentSpec",
          () => K8SIoApiAppsV1DeploymentSpecSchema,
        )
        .optional(),
    }),
    Job: t.object({
      annotations: t.record(t.string(), t.string()).optional(),
      spec: t
        .ref("K8SIoApiBatchV1JobSpec", () => K8SIoApiBatchV1JobSpecSchema)
        .optional(),
    }),
    Secret: t.object({
      annotations: t.record(t.string(), t.string()).optional(),
    }),
    StatefulSet: t.object({
      annotations: t.record(t.string(), t.string()).optional(),
      spec: t
        .ref(
          "K8SIoApiAppsV1StatefulSetSpec",
          () => K8SIoApiAppsV1StatefulSetSpecSchema,
        )
        .optional(),
    }),
  });

export const K8SIoApiBatchV1CronJobSpecSchema = /*#__PURE__*/ t.object({
  concurrencyPolicy: t
    .ref(
      "K8SIoApiBatchV1ConcurrencyPolicy",
      () => K8SIoApiBatchV1ConcurrencyPolicySchema,
    )
    .annotate({
      description:
        "Specifies how to treat concurrent executions of a Job. Valid values are:",
    })
    .optional(),
  failedJobsHistoryLimit: t.integer().optional(),
  jobTemplate: t
    .ref(
      "K8SIoApiBatchV1JobTemplateSpec",
      () => K8SIoApiBatchV1JobTemplateSpecSchema,
    )
    .annotate({
      description:
        "Specifies the job that will be created when executing a CronJob.",
    }),
  schedule: t.string(),
  startingDeadlineSeconds: t.integer().optional(),
  successfulJobsHistoryLimit: t.integer().optional(),
  suspend: t.boolean().optional(),
  timeZone: t.string().optional(),
});

export const K8SIoApiBatchV1ConcurrencyPolicySchema = /*#__PURE__*/ t.string();

export const K8SIoApiBatchV1JobTemplateSpecSchema = /*#__PURE__*/ t.object({
  metadata: t
    .ref("ApisMetaV1ObjectMeta", () => ApisMetaV1ObjectMetaSchema)
    .annotate({
      description:
        "Standard object's metadata of the jobs created from this template. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata",
    })
    .optional(),
  spec: t
    .ref("K8SIoApiBatchV1JobSpec", () => K8SIoApiBatchV1JobSpecSchema)
    .optional(),
});

export const K8SIoApiBatchV1JobSpecSchema = /*#__PURE__*/ t.object({
  activeDeadlineSeconds: t.integer().optional(),
  backoffLimit: t.integer().optional(),
  completionMode: t
    .ref(
      "K8SIoApiBatchV1CompletionMode",
      () => K8SIoApiBatchV1CompletionModeSchema,
    )
    .optional(),
  completions: t.integer().optional(),
  manualSelector: t.boolean().optional(),
  parallelism: t.integer().optional(),
  podFailurePolicy: t
    .ref(
      "K8SIoApiBatchV1PodFailurePolicy",
      () => K8SIoApiBatchV1PodFailurePolicySchema,
    )
    .optional(),
  selector: t
    .ref("ApisMetaV1LabelSelector", () => ApisMetaV1LabelSelectorSchema)
    .optional(),
  suspend: t.boolean().optional(),
  template: t
    .ref(
      "K8SIoApiCoreV1PodTemplateSpec",
      () => K8SIoApiCoreV1PodTemplateSpecSchema,
    )
    .annotate({
      description:
        'Describes the pod that will be created when executing a job. The only allowed template.spec.restartPolicy values are "Never" or "OnFailure". More info: https://kubernetes.io/docs/concepts/workloads/controllers/jobs-run-to-completion/',
    }),
  ttlSecondsAfterFinished: t.integer().optional(),
});

export const K8SIoApiBatchV1CompletionModeSchema = /*#__PURE__*/ t.string();

export const K8SIoApiBatchV1PodFailurePolicySchema = /*#__PURE__*/ t.object({
  rules: t.array(
    t.ref(
      "K8SIoApiBatchV1PodFailurePolicyRule",
      () => K8SIoApiBatchV1PodFailurePolicyRuleSchema,
    ),
  ),
});

export const K8SIoApiBatchV1PodFailurePolicyRuleSchema = /*#__PURE__*/ t.object(
  {
    action: t
      .ref(
        "K8SIoApiBatchV1PodFailurePolicyAction",
        () => K8SIoApiBatchV1PodFailurePolicyActionSchema,
      )
      .annotate({
        description:
          "Specifies the action taken on a pod failure when the requirements are satisfied. Possible values are:",
      }),
    onExitCodes: t
      .ref(
        "K8SIoApiBatchV1PodFailurePolicyOnExitCodesRequirement",
        () => K8SIoApiBatchV1PodFailurePolicyOnExitCodesRequirementSchema,
      )
      .optional(),
    onPodConditions: t.array(
      t.ref(
        "K8SIoApiBatchV1PodFailurePolicyOnPodConditionsPattern",
        () => K8SIoApiBatchV1PodFailurePolicyOnPodConditionsPatternSchema,
      ),
    ),
  },
);

export const K8SIoApiBatchV1PodFailurePolicyActionSchema =
  /*#__PURE__*/ t.string();

export const K8SIoApiBatchV1PodFailurePolicyOnExitCodesRequirementSchema =
  /*#__PURE__*/ t.object({
    containerName: t.string(),
    operator: t
      .ref(
        "K8SIoApiBatchV1PodFailurePolicyOnExitCodesOperator",
        () => K8SIoApiBatchV1PodFailurePolicyOnExitCodesOperatorSchema,
      )
      .annotate({
        description:
          "Represents the relationship between the container exit code(s) and the specified values. Containers completed with success (exit code 0) are excluded from the requirement check. Possible values are:",
      }),
    values: t.array(t.integer()),
  });

export const K8SIoApiBatchV1PodFailurePolicyOnExitCodesOperatorSchema =
  /*#__PURE__*/ t.string();

export const K8SIoApiBatchV1PodFailurePolicyOnPodConditionsPatternSchema =
  /*#__PURE__*/ t.object({
    status: t
      .ref(
        "K8SIoApiCoreV1ConditionStatus",
        () => K8SIoApiCoreV1ConditionStatusSchema,
      )
      .annotate({
        description:
          "Specifies the required Pod condition status. To match a pod condition it is required that the specified status equals the pod condition status. Defaults to True.",
      }),
    type: t
      .ref(
        "K8SIoApiCoreV1PodConditionType",
        () => K8SIoApiCoreV1PodConditionTypeSchema,
      )
      .annotate({
        description:
          "Specifies the required Pod condition type. To match a pod condition it is required that specified type equals the pod condition type.",
      }),
  });

export const K8SIoApiCoreV1ConditionStatusSchema = /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1PodConditionTypeSchema = /*#__PURE__*/ t.string();

export const ApisMetaV1LabelSelectorSchema = /*#__PURE__*/ t.object({
  matchExpressions: t
    .array(
      t.ref(
        "ApisMetaV1LabelSelectorRequirement",
        () => ApisMetaV1LabelSelectorRequirementSchema,
      ),
    )
    .optional(),
  matchLabels: t.record(t.string(), t.string()).optional(),
});

export const ApisMetaV1LabelSelectorRequirementSchema = /*#__PURE__*/ t.object({
  key: t.string(),
  operator: t
    .ref(
      "ApisMetaV1LabelSelectorOperator",
      () => ApisMetaV1LabelSelectorOperatorSchema,
    )
    .annotate({
      description:
        "operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.",
    }),
  values: t.array(t.string()).optional(),
});

export const ApisMetaV1LabelSelectorOperatorSchema = /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1PodTemplateSpecSchema = /*#__PURE__*/ t.object({
  metadata: t
    .ref("ApisMetaV1ObjectMeta", () => ApisMetaV1ObjectMetaSchema)
    .annotate({
      description:
        "Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata",
    })
    .optional(),
  spec: t
    .ref("K8SIoApiCoreV1PodSpec", () => K8SIoApiCoreV1PodSpecSchema)
    .optional(),
});

export const K8SIoApiCoreV1PodSpecSchema = /*#__PURE__*/ t.object({
  activeDeadlineSeconds: t.integer().optional(),
  affinity: t
    .ref("K8SIoApiCoreV1Affinity", () => K8SIoApiCoreV1AffinitySchema)
    .optional(),
  automountServiceAccountToken: t.boolean().optional(),
  dnsConfig: t
    .ref("K8SIoApiCoreV1PodDnsConfig", () => K8SIoApiCoreV1PodDnsConfigSchema)
    .optional(),
  dnsPolicy: t
    .ref("K8SIoApiCoreV1DnsPolicy", () => K8SIoApiCoreV1DnsPolicySchema)
    .annotate({
      description:
        "Set DNS policy for the pod. Defaults to \"ClusterFirst\". Valid values are 'ClusterFirstWithHostNet', 'ClusterFirst', 'Default' or 'None'. DNS parameters given in DNSConfig will be merged with the policy selected with DNSPolicy. To have DNS options set along with hostNetwork, you have to specify DNS policy explicitly to 'ClusterFirstWithHostNet'.",
    })
    .optional(),
  enableServiceLinks: t.boolean().optional(),
  hostAliases: t
    .array(
      t.ref("K8SIoApiCoreV1HostAlias", () => K8SIoApiCoreV1HostAliasSchema),
    )
    .optional(),
  hostIPC: t.boolean().optional(),
  hostNetwork: t.boolean().optional(),
  hostPID: t.boolean().optional(),
  hostUsers: t.boolean().optional(),
  hostname: t.string().optional(),
  imagePullSecrets: t
    .array(
      t.ref(
        "K8SIoApiCoreV1LocalObjectReference",
        () => K8SIoApiCoreV1LocalObjectReferenceSchema,
      ),
    )
    .optional(),
  nodeName: t.string().optional(),
  nodeSelector: t.record(t.string(), t.string()).optional(),
  os: t.ref("K8SIoApiCoreV1PodOs", () => K8SIoApiCoreV1PodOsSchema).optional(),
  overhead: t
    .ref("K8SIoApiCoreV1ResourceList", () => K8SIoApiCoreV1ResourceListSchema)
    .annotate({
      description:
        "Overhead represents the resource overhead associated with running a pod for a given RuntimeClass. This field will be autopopulated at admission time by the RuntimeClass admission controller. If the RuntimeClass admission controller is enabled, overhead must not be set in Pod create requests. The RuntimeClass admission controller will reject Pod create requests which have the overhead already set. If RuntimeClass is configured and selected in the PodSpec, Overhead will be set to the value defined in the corresponding RuntimeClass, otherwise it will remain unset and treated as zero. More info: https://git.k8s.io/enhancements/keps/sig-node/688-pod-overhead/README.md",
    })
    .optional(),
  preemptionPolicy: t
    .ref(
      "K8SIoApiCoreV1PreemptionPolicy",
      () => K8SIoApiCoreV1PreemptionPolicySchema,
    )
    .optional(),
  priority: t.integer().optional(),
  priorityClassName: t.string().optional(),
  readinessGates: t
    .array(
      t.ref(
        "K8SIoApiCoreV1PodReadinessGate",
        () => K8SIoApiCoreV1PodReadinessGateSchema,
      ),
    )
    .optional(),
  resourceClaims: t
    .array(
      t.ref(
        "K8SIoApiCoreV1PodResourceClaim",
        () => K8SIoApiCoreV1PodResourceClaimSchema,
      ),
    )
    .optional(),
  restartPolicy: t
    .ref("K8SIoApiCoreV1RestartPolicy", () => K8SIoApiCoreV1RestartPolicySchema)
    .annotate({
      description:
        "Restart policy for all containers within the pod. One of Always, OnFailure, Never. In some contexts, only a subset of those values may be permitted. Default to Always. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#restart-policy",
    })
    .optional(),
  runtimeClassName: t.string().optional(),
  schedulerName: t.string().optional(),
  schedulingGates: t
    .array(
      t.ref(
        "K8SIoApiCoreV1PodSchedulingGate",
        () => K8SIoApiCoreV1PodSchedulingGateSchema,
      ),
    )
    .optional(),
  securityContext: t
    .ref(
      "K8SIoApiCoreV1PodSecurityContext",
      () => K8SIoApiCoreV1PodSecurityContextSchema,
    )
    .optional(),
  serviceAccount: t.string().optional(),
  serviceAccountName: t.string().optional(),
  setHostnameAsFQDN: t.boolean().optional(),
  shareProcessNamespace: t.boolean().optional(),
  subdomain: t.string().optional(),
  terminationGracePeriodSeconds: t.integer().optional(),
  tolerations: t
    .array(
      t.ref("K8SIoApiCoreV1Toleration", () => K8SIoApiCoreV1TolerationSchema),
    )
    .optional(),
  topologySpreadConstraints: t
    .array(
      t.ref(
        "K8SIoApiCoreV1TopologySpreadConstraint",
        () => K8SIoApiCoreV1TopologySpreadConstraintSchema,
      ),
    )
    .optional(),
});

export const K8SIoApiCoreV1AffinitySchema = /*#__PURE__*/ t.object({
  nodeAffinity: t
    .ref("K8SIoApiCoreV1NodeAffinity", () => K8SIoApiCoreV1NodeAffinitySchema)
    .optional(),
  podAffinity: t
    .ref("K8SIoApiCoreV1PodAffinity", () => K8SIoApiCoreV1PodAffinitySchema)
    .optional(),
  podAntiAffinity: t
    .ref(
      "K8SIoApiCoreV1PodAntiAffinity",
      () => K8SIoApiCoreV1PodAntiAffinitySchema,
    )
    .optional(),
});

export const K8SIoApiCoreV1NodeAffinitySchema = /*#__PURE__*/ t.object({
  preferredDuringSchedulingIgnoredDuringExecution: t
    .array(
      t.ref(
        "K8SIoApiCoreV1PreferredSchedulingTerm",
        () => K8SIoApiCoreV1PreferredSchedulingTermSchema,
      ),
    )
    .optional(),
  requiredDuringSchedulingIgnoredDuringExecution: t
    .ref("K8SIoApiCoreV1NodeSelector", () => K8SIoApiCoreV1NodeSelectorSchema)
    .optional(),
});

export const K8SIoApiCoreV1PreferredSchedulingTermSchema =
  /*#__PURE__*/ t.object({
    preference: t
      .ref(
        "K8SIoApiCoreV1NodeSelectorTerm",
        () => K8SIoApiCoreV1NodeSelectorTermSchema,
      )
      .annotate({
        description:
          "A node selector term, associated with the corresponding weight.",
      }),
    weight: t.integer(),
  });

export const K8SIoApiCoreV1NodeSelectorTermSchema = /*#__PURE__*/ t.object({
  matchExpressions: t
    .array(
      t.ref(
        "K8SIoApiCoreV1NodeSelectorRequirement",
        () => K8SIoApiCoreV1NodeSelectorRequirementSchema,
      ),
    )
    .optional(),
  matchFields: t
    .array(
      t.ref(
        "K8SIoApiCoreV1NodeSelectorRequirement",
        () => K8SIoApiCoreV1NodeSelectorRequirementSchema,
      ),
    )
    .optional(),
});

export const K8SIoApiCoreV1NodeSelectorRequirementSchema =
  /*#__PURE__*/ t.object({
    key: t.string(),
    operator: t
      .ref(
        "K8SIoApiCoreV1NodeSelectorOperator",
        () => K8SIoApiCoreV1NodeSelectorOperatorSchema,
      )
      .annotate({
        description:
          "Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt.",
      }),
    values: t.array(t.string()).optional(),
  });

export const K8SIoApiCoreV1NodeSelectorOperatorSchema =
  /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1NodeSelectorSchema = /*#__PURE__*/ t.object({
  nodeSelectorTerms: t.array(
    t.ref(
      "K8SIoApiCoreV1NodeSelectorTerm",
      () => K8SIoApiCoreV1NodeSelectorTermSchema,
    ),
  ),
});

export const K8SIoApiCoreV1PodAffinitySchema = /*#__PURE__*/ t.object({
  preferredDuringSchedulingIgnoredDuringExecution: t
    .array(
      t.ref(
        "K8SIoApiCoreV1WeightedPodAffinityTerm",
        () => K8SIoApiCoreV1WeightedPodAffinityTermSchema,
      ),
    )
    .optional(),
  requiredDuringSchedulingIgnoredDuringExecution: t
    .array(
      t.ref(
        "K8SIoApiCoreV1PodAffinityTerm",
        () => K8SIoApiCoreV1PodAffinityTermSchema,
      ),
    )
    .optional(),
});

export const K8SIoApiCoreV1WeightedPodAffinityTermSchema =
  /*#__PURE__*/ t.object({
    podAffinityTerm: t
      .ref(
        "K8SIoApiCoreV1PodAffinityTerm",
        () => K8SIoApiCoreV1PodAffinityTermSchema,
      )
      .annotate({
        description:
          "Required. A pod affinity term, associated with the corresponding weight.",
      }),
    weight: t.integer(),
  });

export const K8SIoApiCoreV1PodAffinityTermSchema = /*#__PURE__*/ t.object({
  labelSelector: t
    .ref("ApisMetaV1LabelSelector", () => ApisMetaV1LabelSelectorSchema)
    .optional(),
  namespaceSelector: t
    .ref("ApisMetaV1LabelSelector", () => ApisMetaV1LabelSelectorSchema)
    .optional(),
  namespaces: t.array(t.string()).optional(),
  topologyKey: t.string(),
});

export const K8SIoApiCoreV1PodAntiAffinitySchema = /*#__PURE__*/ t.object({
  preferredDuringSchedulingIgnoredDuringExecution: t
    .array(
      t.ref(
        "K8SIoApiCoreV1WeightedPodAffinityTerm",
        () => K8SIoApiCoreV1WeightedPodAffinityTermSchema,
      ),
    )
    .optional(),
  requiredDuringSchedulingIgnoredDuringExecution: t
    .array(
      t.ref(
        "K8SIoApiCoreV1PodAffinityTerm",
        () => K8SIoApiCoreV1PodAffinityTermSchema,
      ),
    )
    .optional(),
});

export const K8SIoApiCoreV1PodDnsConfigSchema = /*#__PURE__*/ t.object({
  nameservers: t.array(t.string()).optional(),
  options: t
    .array(
      t.ref(
        "K8SIoApiCoreV1PodDnsConfigOption",
        () => K8SIoApiCoreV1PodDnsConfigOptionSchema,
      ),
    )
    .optional(),
  searches: t.array(t.string()).optional(),
});

export const K8SIoApiCoreV1PodDnsConfigOptionSchema = /*#__PURE__*/ t.object({
  name: t.string().optional(),
  value: t.string().optional(),
});

export const K8SIoApiCoreV1DnsPolicySchema = /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1HostAliasSchema = /*#__PURE__*/ t.object({
  hostnames: t.array(t.string()).optional(),
  ip: t.string().optional(),
});

export const K8SIoApiCoreV1LocalObjectReferenceSchema = /*#__PURE__*/ t.object({
  name: t.string().optional(),
});

export const K8SIoApiCoreV1PodOsSchema = /*#__PURE__*/ t.object({
  name: t
    .ref("K8SIoApiCoreV1OsName", () => K8SIoApiCoreV1OsNameSchema)
    .annotate({
      description:
        "Name is the name of the operating system. The currently supported values are linux and windows. Additional value may be defined in future and can be one of: https://github.com/opencontainers/runtime-spec/blob/master/config.md#platform-specific-configuration Clients should expect to handle additional values and treat unrecognized values in this field as os: null",
    }),
});

export const K8SIoApiCoreV1OsNameSchema = /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1PreemptionPolicySchema = /*#__PURE__*/ t.nativeEnum(
  K8SIoApiCoreV1PreemptionPolicy,
);

export const K8SIoApiCoreV1PodReadinessGateSchema = /*#__PURE__*/ t.object({
  conditionType: t
    .ref(
      "K8SIoApiCoreV1PodConditionType",
      () => K8SIoApiCoreV1PodConditionTypeSchema,
    )
    .annotate({
      description:
        "ConditionType refers to a condition in the pod's condition list with matching type.",
    }),
});

export const K8SIoApiCoreV1PodResourceClaimSchema = /*#__PURE__*/ t.object({
  name: t.string(),
  source: t
    .ref("K8SIoApiCoreV1ClaimSource", () => K8SIoApiCoreV1ClaimSourceSchema)
    .annotate({
      description: "Source describes where to find the ResourceClaim.",
    })
    .optional(),
});

export const K8SIoApiCoreV1ClaimSourceSchema = /*#__PURE__*/ t.object({
  resourceClaimName: t.string().optional(),
  resourceClaimTemplateName: t.string().optional(),
});

export const K8SIoApiCoreV1RestartPolicySchema = /*#__PURE__*/ t.nativeEnum(
  K8SIoApiCoreV1RestartPolicy,
);

export const K8SIoApiCoreV1PodSchedulingGateSchema = /*#__PURE__*/ t.object({
  name: t.string(),
});

export const K8SIoApiCoreV1PodSecurityContextSchema = /*#__PURE__*/ t.object({
  fsGroup: t.integer().optional(),
  fsGroupChangePolicy: t
    .ref(
      "K8SIoApiCoreV1PodFsGroupChangePolicy",
      () => K8SIoApiCoreV1PodFsGroupChangePolicySchema,
    )
    .optional(),
  runAsGroup: t.integer().optional(),
  runAsNonRoot: t.boolean().optional(),
  runAsUser: t.integer().optional(),
  seLinuxOptions: t
    .ref(
      "K8SIoApiCoreV1SeLinuxOptions",
      () => K8SIoApiCoreV1SeLinuxOptionsSchema,
    )
    .optional(),
  seccompProfile: t
    .ref(
      "K8SIoApiCoreV1SeccompProfile",
      () => K8SIoApiCoreV1SeccompProfileSchema,
    )
    .optional(),
  supplementalGroups: t.array(t.integer()).optional(),
  sysctls: t
    .array(t.ref("K8SIoApiCoreV1Sysctl", () => K8SIoApiCoreV1SysctlSchema))
    .optional(),
  windowsOptions: t
    .ref(
      "K8SIoApiCoreV1WindowsSecurityContextOptions",
      () => K8SIoApiCoreV1WindowsSecurityContextOptionsSchema,
    )
    .optional(),
});

export const K8SIoApiCoreV1PodFsGroupChangePolicySchema =
  /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1SysctlSchema = /*#__PURE__*/ t.object({
  name: t.string(),
  value: t.string(),
});

export const K8SIoApiCoreV1TolerationSchema = /*#__PURE__*/ t.object({
  effect: t
    .ref("K8SIoApiCoreV1TaintEffect", () => K8SIoApiCoreV1TaintEffectSchema)
    .annotate({
      description:
        "Effect indicates the taint effect to match. Empty means match all taint effects. When specified, allowed values are NoSchedule, PreferNoSchedule and NoExecute.",
    })
    .optional(),
  key: t.string().optional(),
  operator: t
    .ref(
      "K8SIoApiCoreV1TolerationOperator",
      () => K8SIoApiCoreV1TolerationOperatorSchema,
    )
    .annotate({
      description:
        "Operator represents a key's relationship to the value. Valid operators are Exists and Equal. Defaults to Equal. Exists is equivalent to wildcard for value, so that a pod can tolerate all taints of a particular category.",
    })
    .optional(),
  tolerationSeconds: t.integer().optional(),
  value: t.string().optional(),
});

export const K8SIoApiCoreV1TaintEffectSchema = /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1TolerationOperatorSchema = /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1TopologySpreadConstraintSchema =
  /*#__PURE__*/ t.object({
    labelSelector: t
      .ref("ApisMetaV1LabelSelector", () => ApisMetaV1LabelSelectorSchema)
      .optional(),
    matchLabelKeys: t.array(t.string()).optional(),
    maxSkew: t.integer(),
    minDomains: t.integer().optional(),
    nodeAffinityPolicy: t
      .ref(
        "K8SIoApiCoreV1NodeInclusionPolicy",
        () => K8SIoApiCoreV1NodeInclusionPolicySchema,
      )
      .optional(),
    nodeTaintsPolicy: t
      .ref(
        "K8SIoApiCoreV1NodeInclusionPolicy",
        () => K8SIoApiCoreV1NodeInclusionPolicySchema,
      )
      .optional(),
    topologyKey: t.string(),
    whenUnsatisfiable: t
      .ref(
        "K8SIoApiCoreV1UnsatisfiableConstraintAction",
        () => K8SIoApiCoreV1UnsatisfiableConstraintActionSchema,
      )
      .annotate({
        description:
          "WhenUnsatisfiable indicates how to deal with a pod if it doesn't satisfy the spread constraint. - DoNotSchedule (default) tells the scheduler not to schedule it. - ScheduleAnyway tells the scheduler to schedule the pod in any location,",
      }),
  });

export const K8SIoApiCoreV1NodeInclusionPolicySchema = /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1UnsatisfiableConstraintActionSchema =
  /*#__PURE__*/ t.string();

export const K8SIoApiAppsV1DaemonSetSpecSchema = /*#__PURE__*/ t.object({
  minReadySeconds: t.integer().optional(),
  revisionHistoryLimit: t.integer().optional(),
  selector: t
    .ref("ApisMetaV1LabelSelector", () => ApisMetaV1LabelSelectorSchema)
    .optional(),
  template: t
    .ref(
      "K8SIoApiCoreV1PodTemplateSpec",
      () => K8SIoApiCoreV1PodTemplateSpecSchema,
    )
    .annotate({
      description:
        'An object that describes the pod that will be created. The DaemonSet will create exactly one copy of this pod on every node that matches the template\'s node selector (or on every node if no node selector is specified). The only allowed template.spec.restartPolicy value is "Always". More info: https://kubernetes.io/docs/concepts/workloads/controllers/replicationcontroller#pod-template',
    }),
  updateStrategy: t
    .ref(
      "K8SIoApiAppsV1DaemonSetUpdateStrategy",
      () => K8SIoApiAppsV1DaemonSetUpdateStrategySchema,
    )
    .annotate({
      description:
        "An update strategy to replace existing DaemonSet pods with new pods.",
    })
    .optional(),
});

export const K8SIoApiAppsV1DaemonSetUpdateStrategySchema =
  /*#__PURE__*/ t.object({
    rollingUpdate: t
      .ref(
        "K8SIoApiAppsV1RollingUpdateDaemonSet",
        () => K8SIoApiAppsV1RollingUpdateDaemonSetSchema,
      )
      .optional(),
    type: t
      .ref(
        "K8SIoApiAppsV1DaemonSetUpdateStrategyType",
        () => K8SIoApiAppsV1DaemonSetUpdateStrategyTypeSchema,
      )
      .annotate({
        description:
          'Type of daemon set update. Can be "RollingUpdate" or "OnDelete". Default is RollingUpdate.',
      })
      .optional(),
  });

export const K8SIoApiAppsV1RollingUpdateDaemonSetSchema =
  /*#__PURE__*/ t.object({
    maxSurge: t
      .ref("UtilIntstrIntOrString", () => UtilIntstrIntOrStringSchema)
      .optional(),
    maxUnavailable: t
      .ref("UtilIntstrIntOrString", () => UtilIntstrIntOrStringSchema)
      .optional(),
  });

export const K8SIoApiAppsV1DaemonSetUpdateStrategyTypeSchema =
  /*#__PURE__*/ t.nativeEnum(K8SIoApiAppsV1DaemonSetUpdateStrategyType);

export const K8SIoApiAppsV1DeploymentSpecSchema = /*#__PURE__*/ t.object({
  minReadySeconds: t.integer().optional(),
  paused: t.boolean().optional(),
  progressDeadlineSeconds: t.integer().optional(),
  replicas: t.integer().optional(),
  revisionHistoryLimit: t.integer().optional(),
  selector: t
    .ref("ApisMetaV1LabelSelector", () => ApisMetaV1LabelSelectorSchema)
    .optional(),
  strategy: t
    .ref(
      "K8SIoApiAppsV1DeploymentStrategy",
      () => K8SIoApiAppsV1DeploymentStrategySchema,
    )
    .annotate({
      description:
        "The deployment strategy to use to replace existing pods with new ones.",
    })
    .optional(),
  template: t
    .ref(
      "K8SIoApiCoreV1PodTemplateSpec",
      () => K8SIoApiCoreV1PodTemplateSpecSchema,
    )
    .annotate({
      description:
        'Template describes the pods that will be created. The only allowed template.spec.restartPolicy value is "Always".',
    }),
});

export const K8SIoApiAppsV1DeploymentStrategySchema = /*#__PURE__*/ t.object({
  rollingUpdate: t
    .ref(
      "K8SIoApiAppsV1RollingUpdateDeployment",
      () => K8SIoApiAppsV1RollingUpdateDeploymentSchema,
    )
    .optional(),
  type: t
    .ref(
      "K8SIoApiAppsV1DeploymentStrategyType",
      () => K8SIoApiAppsV1DeploymentStrategyTypeSchema,
    )
    .annotate({
      description:
        'Type of deployment. Can be "Recreate" or "RollingUpdate". Default is RollingUpdate.',
    })
    .optional(),
});

export const K8SIoApiAppsV1RollingUpdateDeploymentSchema =
  /*#__PURE__*/ t.object({
    maxSurge: t
      .ref("UtilIntstrIntOrString", () => UtilIntstrIntOrStringSchema)
      .optional(),
    maxUnavailable: t
      .ref("UtilIntstrIntOrString", () => UtilIntstrIntOrStringSchema)
      .optional(),
  });

export const K8SIoApiAppsV1DeploymentStrategyTypeSchema =
  /*#__PURE__*/ t.nativeEnum(K8SIoApiAppsV1DeploymentStrategyType);

export const K8SIoApiAppsV1StatefulSetSpecSchema = /*#__PURE__*/ t.object({
  minReadySeconds: t.integer().optional(),
  ordinals: t
    .ref(
      "K8SIoApiAppsV1StatefulSetOrdinals",
      () => K8SIoApiAppsV1StatefulSetOrdinalsSchema,
    )
    .optional(),
  persistentVolumeClaimRetentionPolicy: t
    .ref(
      "K8SIoApiAppsV1StatefulSetPersistentVolumeClaimRetentionPolicy",
      () => K8SIoApiAppsV1StatefulSetPersistentVolumeClaimRetentionPolicySchema,
    )
    .optional(),
  podManagementPolicy: t
    .ref(
      "K8SIoApiAppsV1PodManagementPolicyType",
      () => K8SIoApiAppsV1PodManagementPolicyTypeSchema,
    )
    .annotate({
      description:
        "podManagementPolicy controls how pods are created during initial scale up, when replacing pods on nodes, or when scaling down. The default policy is `OrderedReady`, where pods are created in increasing order (pod-0, then pod-1, etc) and the controller will wait until each pod is ready before continuing. When scaling down, the pods are removed in the opposite order. The alternative policy is `Parallel` which will create pods in parallel to match the desired scale without waiting, and on scale down will delete all pods at once.",
    })
    .optional(),
  replicas: t.integer().optional(),
  revisionHistoryLimit: t.integer().optional(),
  selector: t
    .ref("ApisMetaV1LabelSelector", () => ApisMetaV1LabelSelectorSchema)
    .optional(),
  serviceName: t.string(),
  template: t
    .ref(
      "K8SIoApiCoreV1PodTemplateSpec",
      () => K8SIoApiCoreV1PodTemplateSpecSchema,
    )
    .annotate({
      description:
        'template is the object that describes the pod that will be created if insufficient replicas are detected. Each pod stamped out by the StatefulSet will fulfill this Template, but have a unique identity from the rest of the StatefulSet. Each pod will be named with the format <statefulsetname>-<podindex>. For example, a pod in a StatefulSet named "web" with index number "3" would be named "web-3". The only allowed template.spec.restartPolicy value is "Always".',
    }),
  updateStrategy: t
    .ref(
      "K8SIoApiAppsV1StatefulSetUpdateStrategy",
      () => K8SIoApiAppsV1StatefulSetUpdateStrategySchema,
    )
    .annotate({
      description:
        "updateStrategy indicates the StatefulSetUpdateStrategy that will be employed to update Pods in the StatefulSet when a revision is made to Template.",
    })
    .optional(),
  volumeClaimTemplates: t
    .array(
      t.ref(
        "K8SIoApiCoreV1PersistentVolumeClaim",
        () => K8SIoApiCoreV1PersistentVolumeClaimSchema,
      ),
    )
    .optional(),
});

export const K8SIoApiAppsV1StatefulSetOrdinalsSchema = /*#__PURE__*/ t.object({
  start: t.integer(),
});

export const K8SIoApiAppsV1StatefulSetPersistentVolumeClaimRetentionPolicySchema =
  /*#__PURE__*/ t.object({
    whenDeleted: t
      .ref(
        "K8SIoApiAppsV1PersistentVolumeClaimRetentionPolicyType",
        () => K8SIoApiAppsV1PersistentVolumeClaimRetentionPolicyTypeSchema,
      )
      .annotate({
        description:
          "WhenDeleted specifies what happens to PVCs created from StatefulSet VolumeClaimTemplates when the StatefulSet is deleted. The default policy of `Retain` causes PVCs to not be affected by StatefulSet deletion. The `Delete` policy causes those PVCs to be deleted.",
      })
      .optional(),
    whenScaled: t
      .ref(
        "K8SIoApiAppsV1PersistentVolumeClaimRetentionPolicyType",
        () => K8SIoApiAppsV1PersistentVolumeClaimRetentionPolicyTypeSchema,
      )
      .annotate({
        description:
          "WhenScaled specifies what happens to PVCs created from StatefulSet VolumeClaimTemplates when the StatefulSet is scaled down. The default policy of `Retain` causes PVCs to not be affected by a scaledown. The `Delete` policy causes the associated PVCs for any excess pods above the replica count to be deleted.",
      })
      .optional(),
  });

export const K8SIoApiAppsV1PersistentVolumeClaimRetentionPolicyTypeSchema =
  /*#__PURE__*/ t.string();

export const K8SIoApiAppsV1PodManagementPolicyTypeSchema =
  /*#__PURE__*/ t.string();

export const K8SIoApiAppsV1StatefulSetUpdateStrategySchema =
  /*#__PURE__*/ t.object({
    rollingUpdate: t
      .ref(
        "K8SIoApiAppsV1RollingUpdateStatefulSetStrategy",
        () => K8SIoApiAppsV1RollingUpdateStatefulSetStrategySchema,
      )
      .optional(),
    type: t
      .ref(
        "K8SIoApiAppsV1StatefulSetUpdateStrategyType",
        () => K8SIoApiAppsV1StatefulSetUpdateStrategyTypeSchema,
      )
      .annotate({
        description:
          "Type indicates the type of the StatefulSetUpdateStrategy. Default is RollingUpdate.",
      })
      .optional(),
  });

export const K8SIoApiAppsV1RollingUpdateStatefulSetStrategySchema =
  /*#__PURE__*/ t.object({
    maxUnavailable: t
      .ref("UtilIntstrIntOrString", () => UtilIntstrIntOrStringSchema)
      .optional(),
    partition: t.integer().optional(),
  });

export const K8SIoApiAppsV1StatefulSetUpdateStrategyTypeSchema =
  /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1PersistentVolumeClaimSchema =
  /*#__PURE__*/ t.intersection(
    t.ref("ApisMetaV1TypeMeta", () => ApisMetaV1TypeMetaSchema),
    t.object({
      metadata: t
        .ref("ApisMetaV1ObjectMeta", () => ApisMetaV1ObjectMetaSchema)
        .annotate({
          description:
            "Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata",
        })
        .optional(),
      spec: t
        .ref(
          "K8SIoApiCoreV1PersistentVolumeClaimSpec",
          () => K8SIoApiCoreV1PersistentVolumeClaimSpecSchema,
        )
        .optional(),
      status: t
        .ref(
          "K8SIoApiCoreV1PersistentVolumeClaimStatus",
          () => K8SIoApiCoreV1PersistentVolumeClaimStatusSchema,
        )
        .annotate({
          description:
            "status represents the current information/status of a persistent volume claim. Read-only. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#persistentvolumeclaims",
        })
        .optional(),
    }),
  );

export const K8SIoApiCoreV1PersistentVolumeClaimSpecSchema =
  /*#__PURE__*/ t.object({
    accessModes: t
      .array(
        t.ref(
          "K8SIoApiCoreV1PersistentVolumeAccessMode",
          () => K8SIoApiCoreV1PersistentVolumeAccessModeSchema,
        ),
      )
      .optional(),
    dataSource: t
      .ref(
        "K8SIoApiCoreV1TypedLocalObjectReference",
        () => K8SIoApiCoreV1TypedLocalObjectReferenceSchema,
      )
      .optional(),
    dataSourceRef: t
      .ref(
        "K8SIoApiCoreV1TypedObjectReference",
        () => K8SIoApiCoreV1TypedObjectReferenceSchema,
      )
      .optional(),
    resources: t
      .ref(
        "K8SIoApiCoreV1ResourceRequirements",
        () => K8SIoApiCoreV1ResourceRequirementsSchema,
      )
      .annotate({
        description:
          "resources represents the minimum resources the volume should have. If RecoverVolumeExpansionFailure feature is enabled users are allowed to specify resource requirements that are lower than previous value but must still be higher than capacity recorded in the status field of the claim. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#resources",
      })
      .optional(),
    selector: t
      .ref("ApisMetaV1LabelSelector", () => ApisMetaV1LabelSelectorSchema)
      .optional(),
    storageClassName: t.string().optional(),
    volumeMode: t
      .ref(
        "K8SIoApiCoreV1PersistentVolumeMode",
        () => K8SIoApiCoreV1PersistentVolumeModeSchema,
      )
      .optional(),
    volumeName: t.string().optional(),
  });

export const K8SIoApiCoreV1PersistentVolumeAccessModeSchema =
  /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1TypedLocalObjectReferenceSchema =
  /*#__PURE__*/ t.object({
    apiGroup: t.string(),
    kind: t.string(),
    name: t.string(),
  });

export const K8SIoApiCoreV1TypedObjectReferenceSchema = /*#__PURE__*/ t.object({
  apiGroup: t.string(),
  kind: t.string(),
  name: t.string(),
  namespace: t.string().optional(),
});

export const K8SIoApiCoreV1PersistentVolumeModeSchema =
  /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1PersistentVolumeClaimStatusSchema =
  /*#__PURE__*/ t.object({
    accessModes: t
      .array(
        t.ref(
          "K8SIoApiCoreV1PersistentVolumeAccessMode",
          () => K8SIoApiCoreV1PersistentVolumeAccessModeSchema,
        ),
      )
      .optional(),
    allocatedResources: t
      .ref("K8SIoApiCoreV1ResourceList", () => K8SIoApiCoreV1ResourceListSchema)
      .annotate({
        description:
          "allocatedResources is the storage resource within AllocatedResources tracks the capacity allocated to a PVC. It may be larger than the actual capacity when a volume expansion operation is requested. For storage quota, the larger value from allocatedResources and PVC.spec.resources is used. If allocatedResources is not set, PVC.spec.resources alone is used for quota calculation. If a volume expansion capacity request is lowered, allocatedResources is only lowered if there are no expansion operations in progress and if the actual volume capacity is equal or lower than the requested capacity. This is an alpha field and requires enabling RecoverVolumeExpansionFailure feature.",
      })
      .optional(),
    capacity: t
      .ref("K8SIoApiCoreV1ResourceList", () => K8SIoApiCoreV1ResourceListSchema)
      .annotate({
        description:
          "capacity represents the actual resources of the underlying volume.",
      })
      .optional(),
    conditions: t
      .array(
        t.ref(
          "K8SIoApiCoreV1PersistentVolumeClaimCondition",
          () => K8SIoApiCoreV1PersistentVolumeClaimConditionSchema,
        ),
      )
      .optional(),
    phase: t
      .ref(
        "K8SIoApiCoreV1PersistentVolumeClaimPhase",
        () => K8SIoApiCoreV1PersistentVolumeClaimPhaseSchema,
      )
      .annotate({
        description:
          "phase represents the current phase of PersistentVolumeClaim.",
      })
      .optional(),
    resizeStatus: t
      .ref(
        "K8SIoApiCoreV1PersistentVolumeClaimResizeStatus",
        () => K8SIoApiCoreV1PersistentVolumeClaimResizeStatusSchema,
      )
      .optional(),
  });

export const K8SIoApiCoreV1PersistentVolumeClaimConditionSchema =
  /*#__PURE__*/ t.object({
    lastProbeTime: t
      .ref("ApisMetaV1Time", () => ApisMetaV1TimeSchema)
      .annotate({
        description: "lastProbeTime is the time we probed the condition.",
      })
      .optional(),
    lastTransitionTime: t
      .ref("ApisMetaV1Time", () => ApisMetaV1TimeSchema)
      .annotate({
        description:
          "lastTransitionTime is the time the condition transitioned from one status to another.",
      })
      .optional(),
    message: t.string().optional(),
    reason: t.string().optional(),
    status: t.ref(
      "K8SIoApiCoreV1ConditionStatus",
      () => K8SIoApiCoreV1ConditionStatusSchema,
    ),
    type: t.ref(
      "K8SIoApiCoreV1PersistentVolumeClaimConditionType",
      () => K8SIoApiCoreV1PersistentVolumeClaimConditionTypeSchema,
    ),
  });

export const ApisMetaV1TimeSchema = /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1PersistentVolumeClaimConditionTypeSchema =
  /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1PersistentVolumeClaimPhaseSchema =
  /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1PersistentVolumeClaimResizeStatusSchema =
  /*#__PURE__*/ t.string();

export const ApisKubepkgV1Alpha1ManifestsSchema = /*#__PURE__*/ t.record(
  t.string(),
  t.any(),
);

export const ApisKubepkgV1Alpha1ServiceAccountSchema = /*#__PURE__*/ t.object({
  rules: t.array(
    t.ref("K8SIoApiRbacV1PolicyRule", () => K8SIoApiRbacV1PolicyRuleSchema),
  ),
  scope: t
    .ref(
      "ApisKubepkgV1Alpha1ScopeType",
      () => ApisKubepkgV1Alpha1ScopeTypeSchema,
    )
    .optional(),
});

export const K8SIoApiRbacV1PolicyRuleSchema = /*#__PURE__*/ t.object({
  apiGroups: t.array(t.string()).optional(),
  nonResourceURLs: t.array(t.string()).optional(),
  resourceNames: t.array(t.string()).optional(),
  resources: t.array(t.string()).optional(),
  verbs: t.array(t.string()),
});

export const ApisKubepkgV1Alpha1ScopeTypeSchema = /*#__PURE__*/ t.nativeEnum(
  ApisKubepkgV1Alpha1ScopeType,
);

export const ApisKubepkgV1Alpha1ServiceSchema = /*#__PURE__*/ t.object({
  clusterIP: t.string().optional(),
  expose: t
    .ref("ApisKubepkgV1Alpha1Expose", () => ApisKubepkgV1Alpha1ExposeSchema)
    .optional(),
  paths: t
    .record(t.string(), t.string())
    .annotate({ description: "Paths [PortName]BashPath" })
    .optional(),
  ports: t
    .record(t.string(), t.integer())
    .annotate({ description: "Ports [PortName]servicePort" })
    .optional(),
});

export const ApisKubepkgV1Alpha1ExposeSchema = /*#__PURE__*/ t.object({
  gateway: t.array(t.string()).optional(),
  type: t.string().annotate({ description: "Type NodePort | Ingress" }),
});

export const ApisKubepkgV1Alpha1VolumeSchema =
  /*#__PURE__*/ t.discriminatorMapping("type", {
    ConfigMap: t.object({
      mountPath: t.string(),
      mountPropagation: t
        .enums(["Bidirectional", "HostToContainer"])
        .optional(),
      optional: t.boolean().optional(),
      prefix: t
        .string()
        .annotate({ description: "Prefix mountPath == export, use as envFrom" })
        .optional(),
      readOnly: t
        .boolean()
        .annotate({ description: "else volumeMounts" })
        .optional(),
      subPath: t.string().optional(),
      opt: t
        .ref(
          "K8SIoApiCoreV1ConfigMapVolumeSource",
          () => K8SIoApiCoreV1ConfigMapVolumeSourceSchema,
        )
        .optional(),
      spec: t
        .ref(
          "ApisKubepkgV1Alpha1SpecData",
          () => ApisKubepkgV1Alpha1SpecDataSchema,
        )
        .optional(),
    }),
    EmptyDir: t.object({
      mountPath: t.string(),
      mountPropagation: t
        .enums(["Bidirectional", "HostToContainer"])
        .optional(),
      optional: t.boolean().optional(),
      prefix: t
        .string()
        .annotate({ description: "Prefix mountPath == export, use as envFrom" })
        .optional(),
      readOnly: t
        .boolean()
        .annotate({ description: "else volumeMounts" })
        .optional(),
      subPath: t.string().optional(),
      opt: t
        .ref(
          "K8SIoApiCoreV1EmptyDirVolumeSource",
          () => K8SIoApiCoreV1EmptyDirVolumeSourceSchema,
        )
        .optional(),
    }),
    HostPath: t.object({
      mountPath: t.string(),
      mountPropagation: t
        .enums(["Bidirectional", "HostToContainer"])
        .optional(),
      optional: t.boolean().optional(),
      prefix: t
        .string()
        .annotate({ description: "Prefix mountPath == export, use as envFrom" })
        .optional(),
      readOnly: t
        .boolean()
        .annotate({ description: "else volumeMounts" })
        .optional(),
      subPath: t.string().optional(),
      opt: t
        .ref(
          "K8SIoApiCoreV1HostPathVolumeSource",
          () => K8SIoApiCoreV1HostPathVolumeSourceSchema,
        )
        .optional(),
    }),
    PersistentVolumeClaim: t.object({
      mountPath: t.string(),
      mountPropagation: t
        .enums(["Bidirectional", "HostToContainer"])
        .optional(),
      optional: t.boolean().optional(),
      prefix: t
        .string()
        .annotate({ description: "Prefix mountPath == export, use as envFrom" })
        .optional(),
      readOnly: t
        .boolean()
        .annotate({ description: "else volumeMounts" })
        .optional(),
      subPath: t.string().optional(),
      opt: t
        .ref(
          "K8SIoApiCoreV1PersistentVolumeClaimVolumeSource",
          () => K8SIoApiCoreV1PersistentVolumeClaimVolumeSourceSchema,
        )
        .optional(),
      spec: t.ref(
        "K8SIoApiCoreV1PersistentVolumeClaimSpec",
        () => K8SIoApiCoreV1PersistentVolumeClaimSpecSchema,
      ),
    }),
    Secret: t.object({
      mountPath: t.string(),
      mountPropagation: t
        .enums(["Bidirectional", "HostToContainer"])
        .optional(),
      optional: t.boolean().optional(),
      prefix: t
        .string()
        .annotate({ description: "Prefix mountPath == export, use as envFrom" })
        .optional(),
      readOnly: t
        .boolean()
        .annotate({ description: "else volumeMounts" })
        .optional(),
      subPath: t.string().optional(),
      opt: t
        .ref(
          "K8SIoApiCoreV1SecretVolumeSource",
          () => K8SIoApiCoreV1SecretVolumeSourceSchema,
        )
        .optional(),
      spec: t
        .ref(
          "ApisKubepkgV1Alpha1SpecData",
          () => ApisKubepkgV1Alpha1SpecDataSchema,
        )
        .optional(),
    }),
  });

export const K8SIoApiCoreV1ConfigMapVolumeSourceSchema =
  /*#__PURE__*/ t.intersection(
    t.ref(
      "K8SIoApiCoreV1LocalObjectReference",
      () => K8SIoApiCoreV1LocalObjectReferenceSchema,
    ),
    t.object({
      defaultMode: t.integer().optional(),
      items: t
        .array(
          t.ref("K8SIoApiCoreV1KeyToPath", () => K8SIoApiCoreV1KeyToPathSchema),
        )
        .optional(),
      optional: t.boolean().optional(),
    }),
  );

export const K8SIoApiCoreV1KeyToPathSchema = /*#__PURE__*/ t.object({
  key: t.string(),
  mode: t.integer().optional(),
  path: t.string(),
});

export const ApisKubepkgV1Alpha1SpecDataSchema = /*#__PURE__*/ t.object({
  data: t.record(t.string(), t.string()),
});

export const K8SIoApiCoreV1EmptyDirVolumeSourceSchema = /*#__PURE__*/ t.object({
  medium: t
    .ref("K8SIoApiCoreV1StorageMedium", () => K8SIoApiCoreV1StorageMediumSchema)
    .annotate({
      description:
        'medium represents what type of storage medium should back this directory. The default is "" which means to use the node\'s default medium. Must be an empty string (default) or Memory. More info: https://kubernetes.io/docs/concepts/storage/volumes#emptydir',
    })
    .optional(),
  sizeLimit: t
    .ref("ApiResourceQuantity", () => ApiResourceQuantitySchema)
    .optional(),
});

export const K8SIoApiCoreV1StorageMediumSchema = /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1HostPathVolumeSourceSchema = /*#__PURE__*/ t.object({
  path: t.string(),
  type: t
    .ref("K8SIoApiCoreV1HostPathType", () => K8SIoApiCoreV1HostPathTypeSchema)
    .optional(),
});

export const K8SIoApiCoreV1HostPathTypeSchema = /*#__PURE__*/ t.string();

export const K8SIoApiCoreV1PersistentVolumeClaimVolumeSourceSchema =
  /*#__PURE__*/ t.object({
    claimName: t.string(),
    readOnly: t
      .boolean()
      .annotate({ description: "else volumeMounts" })
      .optional(),
  });

export const K8SIoApiCoreV1SecretVolumeSourceSchema = /*#__PURE__*/ t.object({
  defaultMode: t.integer().optional(),
  items: t
    .array(
      t.ref("K8SIoApiCoreV1KeyToPath", () => K8SIoApiCoreV1KeyToPathSchema),
    )
    .optional(),
  optional: t.boolean().optional(),
  secretName: t.string().optional(),
});

export const ApisKubepkgV1Alpha1StatusSchema = /*#__PURE__*/ t.object({
  digests: t
    .array(
      t.ref(
        "ApisKubepkgV1Alpha1DigestMeta",
        () => ApisKubepkgV1Alpha1DigestMetaSchema,
      ),
    )
    .optional(),
  endpoint: t.record(t.string(), t.string()).optional(),
  images: t.record(t.string(), t.string()).optional(),
  resources: t.array(t.record(t.string(), t.any())).optional(),
});

export const ApisKubepkgV1Alpha1DigestMetaSchema = /*#__PURE__*/ t.object({
  digest: t.string(),
  name: t.string(),
  platform: t.string().optional(),
  size: t.ref(
    "ApisKubepkgV1Alpha1FileSize",
    () => ApisKubepkgV1Alpha1FileSizeSchema,
  ),
  tag: t.string().optional(),
  type: t.ref(
    "ApisKubepkgV1Alpha1DigestMetaType",
    () => ApisKubepkgV1Alpha1DigestMetaTypeSchema,
  ),
});

export const ApisKubepkgV1Alpha1FileSizeSchema = /*#__PURE__*/ t.integer();

export const ApisKubepkgV1Alpha1DigestMetaTypeSchema =
  /*#__PURE__*/ t.nativeEnum(ApisKubepkgV1Alpha1DigestMetaType);

export const ApisKubepkgV1Alpha1KubePkgListSchema =
  /*#__PURE__*/ t.intersection(
    t.ref("ApisMetaV1TypeMeta", () => ApisMetaV1TypeMetaSchema),
    t.object({
      items: t.array(
        t.ref(
          "ApisKubepkgV1Alpha1KubePkg",
          () => ApisKubepkgV1Alpha1KubePkgSchema,
        ),
      ),
      metadata: t
        .ref("ApisMetaV1ListMeta", () => ApisMetaV1ListMetaSchema)
        .optional(),
    }),
  );

export const ApisMetaV1ListMetaSchema = /*#__PURE__*/ t.object({
  continue: t.string().optional(),
  remainingItemCount: t.integer().optional(),
  resourceVersion: t.string().optional(),
  selfLink: t.string().optional(),
});

export const GroupDeploymentIdSchema = /*#__PURE__*/ t.string();

export const KubepkgSchema = /*#__PURE__*/ t.intersection(
  t.ref(
    "DatatypesCreationUpdationDeletionTime",
    () => DatatypesCreationUpdationDeletionTimeSchema,
  ),
  t.object({
    group: t.string().annotate({ description: "Kubepkg Group" }),
    kubepkgID: t
      .ref("KubepkgId", () => KubepkgIdSchema)
      .annotate({ description: "Kubepkg ID" }),
    name: t.string().annotate({ description: "Kubepkg 名称" }),
  }),
);

export const KubepkgIdSchema = /*#__PURE__*/ t.string();

export const KubepkgChannelSchema = /*#__PURE__*/ t.nativeEnum(KubepkgChannel);

export const KubepkgRevisionIdSchema = /*#__PURE__*/ t.string();

export const KubepkgVersionInfoSchema = /*#__PURE__*/ t.object({
  revisionID: t.ref("KubepkgRevisionId", () => KubepkgRevisionIdSchema),
  version: t.string(),
});

export const GroupRobotDataListSchema = /*#__PURE__*/ t.object({
  data: t.array(t.ref("GroupRobot", () => GroupRobotSchema)),
  total: t.integer(),
});

export const GroupRobotSchema = /*#__PURE__*/ t.intersection(
  t.ref("GroupAccount", () => GroupAccountSchema),
  t.ref("AccountRobotInfo", () => AccountRobotInfoSchema),
  t.object(),
);

export const AccountRobotInfoSchema = /*#__PURE__*/ t.object({
  name: t.string(),
});

export const AccountRobotSchema = /*#__PURE__*/ t.intersection(
  t.ref("Account", () => AccountSchema),
  t.ref("AccountRobotInfo", () => AccountRobotInfoSchema),
  t.object(),
);

export const GroupRefreshGroupRobotTokenDataSchema =
  /*#__PURE__*/ t.intersection(
    t.ref("GroupRoleInfo", () => GroupRoleInfoSchema),
    t.object({
      expiresIn: t.integer().annotate({ description: "秒" }),
    }),
  );

export const AuthOperatorAccountSchema = /*#__PURE__*/ t.intersection(
  t.ref("AccountUser", () => AccountUserSchema),
  t.object({
    accountType: t.ref("AccountType", () => AccountTypeSchema),
    adminRole: t.ref("GroupRoleType", () => GroupRoleTypeSchema),
    groupRoles: t
      .record(
        t.ref("GroupId", () => GroupIdSchema),
        t.ref("GroupRoleType", () => GroupRoleTypeSchema),
      )
      .optional(),
  }),
);

export const RbacPermissionsSchema = /*#__PURE__*/ t.record(
  t.string(),
  t.array(t.any()),
);
