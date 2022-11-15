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

export type ApisKubepkgV1Alpha1Spec = any;

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

export interface ApisKubepkgV1Alpha1Statuses {
  [k: string]: any;
}

export interface ApisKubepkgV1Alpha1Status {
  digests?: Array<ApisKubepkgV1Alpha1DigestMeta>;
  images?: {
    [k: string]: string;
  };
  statuses?: ApisKubepkgV1Alpha1Statuses;
}

export interface ApisKubepkgV1Alpha1KubePkg extends ApisMetaV1TypeMeta {
  metadata?: ApisMetaV1ObjectMeta;
  spec: ApisKubepkgV1Alpha1Spec;
  status?: ApisKubepkgV1Alpha1Status;
}

export interface GroupDeploymentDataList {
  data: Array<ApisKubepkgV1Alpha1KubePkg>;
  total?: number;
}

export const listGroupEnvDeployment = /*#__PURE__*/ createRequest<
  {
    authorization?: string;
    groupName: string;
    envName: string;
    size?: number;
    offset?: number;
  },
  GroupDeploymentDataList
>(
  "dashboard.ListGroupEnvDeployment",
  ({
    authorization: query_authorization,
    groupName: path_groupName,
    envName: path_envName,
    size: query_size,
    offset: query_offset,
  }) => ({
    method: "GET",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/envs/${path_envName}/deployments`,
    params: {
      authorization: query_authorization,
      size: query_size,
      offset: query_offset,
    },
  })
);

export const putGroupEnvDeployment = /*#__PURE__*/ createRequest<
  {
    authorization?: string;
    groupName: string;
    envName: string;
    body: ApisKubepkgV1Alpha1KubePkg;
  },
  ApisKubepkgV1Alpha1KubePkg
>(
  "dashboard.PutGroupEnvDeployment",
  ({
    authorization: query_authorization,
    groupName: path_groupName,
    envName: path_envName,
    body: body,
  }) => ({
    method: "PUT",
    url: `/api/kubepkg-dashboard/v0/groups/${path_groupName}/envs/${path_envName}/deployments`,
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
  groupRoles?: {
    [k: GroupId]: keyof typeof GroupRoleType;
  };
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
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
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
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
    "/api/kubepkg-dashboard/v0/groups": {
      get: {
        tags: ["group"],
        operationId: "ListGroup",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
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
      get: {
        tags: ["group"],
        operationId: "GetGroup",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
                    $ref: "#/components/schemas/GroupEnv",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/kubepkg-dashboard/v0/groups/{groupName}/envs/{envName}": {
      put: {
        tags: ["group"],
        operationId: "PutGroupEnv",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
                  $ref: "#/components/schemas/GroupEnv",
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
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
                  $ref: "#/components/schemas/GroupDeploymentDataList",
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
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
    "/api/kubepkg-dashboard/v0/groups/{groupName}/robots": {
      get: {
        tags: ["group"],
        operationId: "ListGroupRobot",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
            in: "query",
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
    "/api/kubepkg-dashboard/v0/user": {
      get: {
        tags: ["user"],
        operationId: "CurrentUser",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
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
            schema: {
              type: "string",
            },
          },
          {
            name: "authorization",
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
      ApisKubepkgV1Alpha1FileSize: {
        type: "integer",
        format: "int64",
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.FileSize",
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
          statuses: {
            allOf: [
              {
                $ref: "#/components/schemas/ApisKubepkgV1Alpha1Statuses",
              },
            ],
            "x-go-field-name": "Statuses",
          },
        },
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.Status",
      },
      ApisKubepkgV1Alpha1Statuses: {
        type: "object",
        additionalProperties: {},
        propertyNames: {
          type: "string",
        },
        "x-go-vendor-type":
          "github.com/octohelm/kubepkg/pkg/apis/kubepkg/v1alpha1.Statuses",
      },
      ApisMetaV1FieldsV1: {
        type: "object",
        "x-go-vendor-type": "k8s.io/apimachinery/pkg/apis/meta/v1.FieldsV1",
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
      DatatypesSfid: {
        type: "string",
        description: "openapi:strfmt snowflake-id",
        "x-go-vendor-type": "github.com/octohelm/storage/pkg/datatypes.SFID",
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
      GroupDeploymentDataList: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ApisKubepkgV1Alpha1KubePkg",
            },
            "x-go-field-name": "Data",
          },
          total: {
            type: "integer",
            format: "int32",
            "x-go-field-name": "Total",
          },
        },
        required: ["data"],
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
          clusterID: {
            allOf: [
              {
                $ref: "#/components/schemas/DatatypesSfid",
              },
            ],
            description: "关联集群",
            "x-go-field-name": "ClusterID",
          },
        },
        required: ["clusterID"],
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
        },
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
      TypesUid: {
        type: "string",
        "x-go-vendor-type": "k8s.io/apimachinery/pkg/types.UID",
      },
    },
  },
};
