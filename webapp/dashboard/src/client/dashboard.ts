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
    authorization?: string;
    accountID?: Array<AccountId>;
    identity?: Array<string>;
    size?: number;
    offset?: number;
  },
  AccountUserDataList
>(
  "dashboard.ListAccount",
  ({
    authorization: query_authorization,
    accountID: query_accountId,
    identity: query_identity,
    size: query_size,
    offset: query_offset,
  }) => ({
    method: "GET",
    url: "/api/kubepkg-dashboard/v0/accounts",
    params: {
      authorization: query_authorization,
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
    authorization?: string;
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
    authorization: query_authorization,
    accountID: query_accountId,
    identity: query_identity,
    size: query_size,
    offset: query_offset,
    roleType: query_roleType,
  }) => ({
    method: "GET",
    url: "/api/kubepkg-dashboard/v0/admin/accounts",
    params: {
      authorization: query_authorization,
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
    authorization?: string;
    accountID: AccountId;
  },
  null
>(
  "dashboard.DeleteAdminAccount",
  ({ authorization: query_authorization, accountID: path_accountId }) => ({
    method: "DELETE",
    url: `/api/kubepkg-dashboard/v0/admin/accounts/${path_accountId}`,
    params: {
      authorization: query_authorization,
    },
  })
);

export interface GroupRoleInfo {
  roleType: keyof typeof GroupRoleType;
}

export const putAdminAccount = /*#__PURE__*/ createRequest<
  {
    authorization?: string;
    accountID: AccountId;
    body: GroupRoleInfo;
  },
  GroupAccount
>(
  "dashboard.PutAdminAccount",
  ({
    authorization: query_authorization,
    accountID: path_accountId,
    body: body,
  }) => ({
    method: "PUT",
    url: `/api/kubepkg-dashboard/v0/admin/accounts/${path_accountId}`,
    params: {
      authorization: query_authorization,
    },
    body: body,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

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

export const listCluster = /*#__PURE__*/ createRequest<
  {
    authorization?: string;
  },
  Array<Cluster>
>("dashboard.ListCluster", ({ authorization: query_authorization }) => ({
  method: "GET",
  url: "/api/kubepkg-dashboard/v0/clusters",
  params: {
    authorization: query_authorization,
  },
}));

export const putCluster = /*#__PURE__*/ createRequest<
  {
    authorization?: string;
    name: string;
    body: ClusterInfo;
  },
  Cluster
>(
  "dashboard.PutCluster",
  ({ authorization: query_authorization, name: path_name, body: body }) => ({
    method: "PUT",
    url: `/api/kubepkg-dashboard/v0/clusters/${path_name}`,
    params: {
      authorization: query_authorization,
    },
    body: body,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export const renameCluster = /*#__PURE__*/ createRequest<
  {
    authorization?: string;
    name: string;
    newName: string;
  },
  Cluster
>(
  "dashboard.RenameCluster",
  ({
    authorization: query_authorization,
    name: path_name,
    newName: path_newName,
  }) => ({
    method: "PUT",
    url: `/api/kubepkg-dashboard/v0/clusters/${path_name}/rename/${path_newName}`,
    params: {
      authorization: query_authorization,
    },
  })
);

export interface GroupInfo {
  desc?: string;
}

export interface Group
  extends GroupInfo,
    DatatypesCreationUpdationDeletionTime {
  groupID: GroupId;
  name: string;
}

export const listGroup = /*#__PURE__*/ createRequest<
  {
    authorization?: string;
  },
  Array<Group>
>("dashboard.ListGroup", ({ authorization: query_authorization }) => ({
  method: "GET",
  url: "/api/kubepkg-dashboard/v0/groups",
  params: {
    authorization: query_authorization,
  },
}));

export const getGroup = /*#__PURE__*/ createRequest<
  {
    authorization?: string;
    groupName: string;
  },
  Group
>(
  "dashboard.GetGroup",
  ({ authorization: query_authorization, groupName: path_groupName }) => ({
    method: "GET",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}`,
    params: {
      authorization: query_authorization,
    },
  })
);

export const putGroup = /*#__PURE__*/ createRequest<
  {
    authorization?: string;
    groupName: string;
    body: GroupInfo;
  },
  Group
>(
  "dashboard.PutGroup",
  ({
    authorization: query_authorization,
    groupName: path_groupName,
    body: body,
  }) => ({
    method: "PUT",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}`,
    params: {
      authorization: query_authorization,
    },
    body: body,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export const listGroupAccount = /*#__PURE__*/ createRequest<
  {
    authorization?: string;
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
    authorization: query_authorization,
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
      authorization: query_authorization,
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
    authorization?: string;
    groupName: string;
    accountID: AccountId;
  },
  null
>(
  "dashboard.DeleteGroupAccount",
  ({
    authorization: query_authorization,
    groupName: path_groupName,
    accountID: path_accountId,
  }) => ({
    method: "DELETE",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/accounts/${path_accountId}`,
    params: {
      authorization: query_authorization,
    },
  })
);

export const putGroupAccount = /*#__PURE__*/ createRequest<
  {
    authorization?: string;
    groupName: string;
    accountID: AccountId;
    body: GroupRoleInfo;
  },
  GroupAccount
>(
  "dashboard.PutGroupAccount",
  ({
    authorization: query_authorization,
    groupName: path_groupName,
    accountID: path_accountId,
    body: body,
  }) => ({
    method: "PUT",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/accounts/${path_accountId}`,
    params: {
      authorization: query_authorization,
    },
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

export type DatatypesSfid = string;

export interface GroupEnvCluster {
  clusterID: DatatypesSfid;
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

export const listGroupEnv = /*#__PURE__*/ createRequest<
  {
    authorization?: string;
    groupName: string;
  },
  Array<GroupEnv>
>(
  "dashboard.ListGroupEnv",
  ({ authorization: query_authorization, groupName: path_groupName }) => ({
    method: "GET",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/envs`,
    params: {
      authorization: query_authorization,
    },
  })
);

export const putGroupEnv = /*#__PURE__*/ createRequest<
  {
    authorization?: string;
    groupName: string;
    envName: string;
    body: GroupEnvInfo;
  },
  GroupEnv
>(
  "dashboard.PutGroupEnv",
  ({
    authorization: query_authorization,
    groupName: path_groupName,
    envName: path_envName,
    body: body,
  }) => ({
    method: "PUT",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/envs/${path_envName}`,
    params: {
      authorization: query_authorization,
    },
    body: body,
    headers: {
      "Content-Type": "application/json",
    },
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
    authorization?: string;
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
    authorization: query_authorization,
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
      authorization: query_authorization,
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
    authorization?: string;
    groupName: string;
    body: AccountRobotInfo;
  },
  AccountRobot
>(
  "dashboard.CreateGroupRobot",
  ({
    authorization: query_authorization,
    groupName: path_groupName,
    body: body,
  }) => ({
    method: "PUT",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/robots`,
    params: {
      authorization: query_authorization,
    },
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
    authorization?: string;
    groupName: string;
    robotID: AccountId;
    body: GroupRefreshGroupRobotTokenData;
  },
  AuthToken
>(
  "dashboard.RefreshGroupRobotToken",
  ({
    authorization: query_authorization,
    groupName: path_groupName,
    robotID: path_robotId,
    body: body,
  }) => ({
    method: "PUT",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/robots/${path_robotId}/tokens`,
    params: {
      authorization: query_authorization,
    },
    body: body,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export interface AuthOperatorAccount extends AccountUser {
  accountType: keyof typeof AccountType;
  adminRole: keyof typeof GroupRoleType;
}

export const currentUser = /*#__PURE__*/ createRequest<
  {
    authorization?: string;
  },
  AuthOperatorAccount
>("dashboard.CurrentUser", ({ authorization: query_authorization }) => ({
  method: "GET",
  url: "/api/kubepkg-dashboard/v0/user",
  params: {
    authorization: query_authorization,
  },
}));

export interface RbacPermissions {
  [k: string]: Array<any>;
}

export const currentPermissions = /*#__PURE__*/ createRequest<
  {
    authorization?: string;
  },
  RbacPermissions
>("dashboard.CurrentPermissions", ({ authorization: query_authorization }) => ({
  method: "GET",
  url: "/api/kubepkg-dashboard/v0/user/permissions",
  params: {
    authorization: query_authorization,
  },
}));
