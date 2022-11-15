import { last, map, orderBy, values } from "@innoai-tech/lodash";
import { useObservable } from "@innoai-tech/reactutil";
import {
  Link as RouterLink
} from "react-router-dom";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Link,
  Box,
  Tooltip,
  Stack,
  Theme,
  useTheme
} from "@mui/material";
import {
  kubepkgName,
  deploymentID,
  deploymentSettingID,
  GroupEnvDeploymentsProvider,
  openAPISpecDoc,
  revision
} from "../group";
import { IconButtonWithTooltip } from "../layout";
import { AccessControl } from "../auth";
import { Download, EditOutlined } from "@mui/icons-material";
import { useGroupEnvDeploymentFormWithDialog } from "./GroupEnvDeployementForm";
import { Fragment, ReactNode, useMemo } from "react";
import type { ApisKubepkgV1Alpha1KubePkg } from "../client/dashboard";
import { openAPISpecPath } from "../group";

const InfoSpan = ({
                    label,
                    children
                  }: {
  label?: ReactNode;
  children: ReactNode;
}) => {
  return (
    <Box
      component={"span"}
      sx={{
        display: "block",
        fontFamily: "monospace",
        fontSize: 10,
        lineHeight: 1.1,
        marginTop: 0.5,
        marginBottom: 0.5
      }}
    >
      {label && (
        <Box
          component={"span"}
          sx={{
            display: "block",
            opacity: 0.7,
            fontSize: "0.7em",
            lineHeight: 1.2,
            paddingBottom: 0.2
          }}
        >
          {label}
        </Box>
      )}
      <Box component={"span"} sx={{ display: "block" }}>
        {children}
      </Box>
    </Box>
  );
};

const DeploymentEndpoints = ({
                               kubepkg
                             }: {
  kubepkg: ApisKubepkgV1Alpha1KubePkg;
}) => {
  if (kubepkg.status?.endpoint) {
    const openAPISpec = openAPISpecPath(kubepkg);

    return (
      <>
        {map(kubepkg.status?.endpoint, (address, name) => {
          if (name !== "default") {
            return (
              <InfoSpan key={name} label={`endpoint/${name}`}>
                <Link target={"_blank"} href={address}>
                  {address}
                </Link>
                {openAPISpec && (
                  <Tooltip title={"OpenAPI 文档"}>
                    <RouterLink
                      target={"_blank"}
                      to={openAPISpecDoc(`${address}${openAPISpec}`)}
                    >
                      {openAPISpec}
                    </RouterLink>
                  </Tooltip>
                )}
              </InfoSpan>
            );
          }
          return null;
        })}
      </>
    );
  }

  return null;
};

const ReasonMessage = ({
                         reason,
                         message
                       }: {
  message: string;
  reason: string;
}) => {
  const theme = useTheme();
  return (
    <Box
      component={"span"}
      sx={{ color: theme.palette.error.main, fontWeight: "bold" }}
    >
      {reason}: {message}
    </Box>
  );
};

const ContainerStatuses = ({
                             name,
                             kubepkg
                           }: {
  name: string;
  kubepkg: ApisKubepkgV1Alpha1KubePkg;
}) => {
  return (
    <Box component={"span"}>
      {map(kubepkg.status?.resources, (r: any, i) => {
        if (r.apiVersion == "apps/v1") {
          const status = r.status;
          const latestPodStatus = last(status.podStatuses) as any;

          return (
            <Fragment key={i}>
              {map(
                latestPodStatus?.containerStatuses,
                (containerStatus: any, i) => {
                  if (containerStatus.name != name || containerStatus.started) {
                    return null;
                  }

                  return (
                    <Fragment key={i}>
                      {map(containerStatus.state, (v, k) => (
                        <ReasonMessage
                          key={k}
                          reason={v.reason}
                          message={v.message}
                        />
                      ))}
                    </Fragment>
                  );
                }
              )}
            </Fragment>
          );
        }
        return null;
      })}
    </Box>
  );
};

export const SpecStatus = ({
                             kubepkg
                           }: {
  kubepkg: ApisKubepkgV1Alpha1KubePkg;
}) => {
  return (
    <Box component={"span"}>
      <InfoSpan>
        {map(kubepkg.status?.resources, (r: any, i) => (
          <Box component={"span"} key={i}>
            {r.status?.reason && (
              <ReasonMessage
                reason={r.status?.reason}
                message={r.status?.message}
              />
            )}
          </Box>
        ))}
      </InfoSpan>
      {map(kubepkg.spec.containers, (_, name) => (
        <InfoSpan key={name}>
          <ContainerStatuses name={name} kubepkg={kubepkg} />
        </InfoSpan>
      ))}
    </Box>
  );
};

const colorByConditionType = (theme: Theme, t: string, status: string) => {
  if (status !== "True") {
    return theme.palette.warning.light;
  }
  switch (t) {
    case "Progressing":
    case "ConfigMap":
    case "Secret":
    case "Service":
    case "Ingress":
      return theme.palette.primary.light;
  }
  return theme.palette.success.light;
};

const ConditionBox = ({ type, status }: { type: string; status: string }) => {
  const theme = useTheme();

  return (
    <Box
      component={"span"}
      sx={{
        textAlign: "center",
        padding: "0 0.4em",
        lineHeight: 1.14,
        borderRadius: "2px",
        color: "#fff",
        fontWeight: "bold",
        backgroundColor: colorByConditionType(theme, type, status)
      }}
    >
      {type[0]}
    </Box>
  );
};

const statusOf = (r: any) => {
  if (r.apiVersion == "apps/v1") {
    for (const c of r.status.conditions) {
      if (c.status != "True") {
        return c.status;
      }
    }
  }

  if (r.status?.reason) {
    return "False";
  }

  return "True";
};

const DeploymentConditions = ({
                                kubepkg
                              }: {
  kubepkg: ApisKubepkgV1Alpha1KubePkg;
}) => (
  <InfoSpan>
    <Stack spacing={0.5} sx={{ alignItems: "flex-end" }}>
      <Stack component={"span"} direction={"row"} spacing={0.5}>
        {map(
          orderBy(kubepkg.status?.resources, (r: any) => r.apiVersion),
          (r: any, i) => {
            return (
              <Tooltip
                title={`${r.metadata.name}.${r.kind}/${r.apiVersion}`}
                key={i}
              >
                <Box component={"span"}>
                  <ConditionBox type={r.kind} status={statusOf(r)} />
                </Box>
              </Tooltip>
            );
          }
        )}
      </Stack>
      <Box component={"span"} sx={{ fontSize: "0.8em" }}>
        {map(
          orderBy(kubepkg.status?.resources, (r: any) => r.apiVersion),
          (r: any, i) => {
            if (r.apiVersion == "apps/v1") {
              const status = r.status;

              return (
                <Stack key={i} spacing={0.5}>
                  <Stack component={"span"} spacing={0.5} direction={"row"}>
                    <Stack component={"span"} spacing={0.5}>
                      {map(status.podStatuses, (podStatus, i) => (
                        <Stack
                          key={i}
                          component={"span"}
                          direction={"row"}
                          spacing={0.5}
                        >
                          {map(podStatus.conditions, (c, i) => (
                            <Tooltip
                              title={`${c.type}${
                                c.message ? `: ${c.message}` : ""
                              }`}
                              key={i}
                            >
                              <Box component={"span"}>
                                <ConditionBox type={c.type} status={c.status} />
                              </Box>
                            </Tooltip>
                          ))}
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Stack>
              );
            }

            return null;
          }
        )}
      </Box>
    </Stack>
  </InfoSpan>
);

const canUpgrade = (kubepkg: ApisKubepkgV1Alpha1KubePkg): boolean => (kubepkg as any)?.upgrade;

const isLatestUpgrade = (kubepkg: ApisKubepkgV1Alpha1KubePkg): boolean => (kubepkg as any)?.upgrade?.latest;

const KubePkgHeading = ({
                          kubepkg
                        }: {
  kubepkg: ApisKubepkgV1Alpha1KubePkg;
}) => {
  const theme = useTheme();

  return (
    <Box
      component={"span"}
      sx={{
        fontFamily: "monospace",
        lineHeight: 1.2,
        paddingTop: 0.5,
        paddingBottom: 0.5,
        display: "block"
      }}
    >
      <Box component={"span"}>
        <Stack
          component={"span"}
          spacing={1}
          direction={"row"}
          sx={{
            fontFamily: "monospace",
            fontSize: "0.5em",
            opacity: 0.5
          }}
        >
          <Box component={"span"}>{`${kubepkgName(kubepkg)}`}</Box>
          <Box component={"span"}>{`d${deploymentID(kubepkg)}`}</Box>
          <Box component={"span"}>{`r${revision(kubepkg)}`}</Box>
          <Box component={"span"}>{`s${deploymentSettingID(kubepkg)}`}</Box>
        </Stack>
      </Box>
      <Box
        component={"span"}
        sx={{
          display: "block",
          fontWeight: "bold"
        }}
      >
        {kubepkg.spec.deploy?.kind}/{kubepkg.metadata?.name}
      </Box>
      <Stack
        component={"span"}
        direction={"row"}
        spacing={1}
        sx={{ alignItems: "center" }}
      >
        <Box
          component={"span"}
          sx={{
            fontWeight: "bold",
            opacity: 0.5
          }}
        >
          {kubepkg.spec.version}
        </Box>
        {canUpgrade(kubepkg) && (
          <Box
            component={"span"}
            sx={{
              fontSize: "0.6em",
              border: "1px solid",
              borderRadius: "2px",
              whiteSpace: "nowrap",
              paddingTop: 0.3,
              paddingBottom: 0.2,
              paddingLeft: 0.6,
              paddingRight: 0.6,
              borderColor: isLatestUpgrade(kubepkg)
                ? theme.palette.success.light
                : theme.palette.warning.light,
              color: isLatestUpgrade(kubepkg)
                ? theme.palette.success.light
                : theme.palette.warning.light
            }}
          >
            {isLatestUpgrade(kubepkg) ? "最新" : "有更新"}
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export const GroupEnvDeploymentListItem = ({
                                             kubepkg
                                           }: {
  kubepkg: ApisKubepkgV1Alpha1KubePkg;
}) => {
  const form$ = useGroupEnvDeploymentFormWithDialog(kubepkg);

  const kubepkgName = kubepkg.metadata?.name || deploymentID(kubepkg);
  const spec = kubepkg.spec;

  if (!spec.deploy) {
    return (
      <ListItem>
        <ListItemText primary={kubepkgName} secondary={spec.version} />
      </ListItem>
    );
  }

  return (
    <ListItem>
      <AccessControl op={form$}>
        <ListItemAvatar>
          <IconButtonWithTooltip
            edge="end"
            label={form$.dialog$.title}
            onClick={() => {
              form$.dialog$.next(true);
            }}
          >
            <EditOutlined />
          </IconButtonWithTooltip>
          {form$.dialog$.render()}
        </ListItemAvatar>
      </AccessControl>
      <ListItemText
        primary={
          <Stack spacing={1} component={"span"} direction={"row"}>
            <Stack
              spacing={2}
              component={"span"}
              direction={"row"}
              sx={{ alignItems: "center", flex: 1 }}
            >
              <KubePkgHeading kubepkg={kubepkg} />
            </Stack>
            <DeploymentConditions kubepkg={kubepkg} />
          </Stack>
        }
        secondary={
          <Box
            component={"span"}
            sx={{ display: "block" }}
          >
            <DeploymentEndpoints kubepkg={kubepkg} />
            <SpecStatus kubepkg={kubepkg} />
          </Box>
        }
      />
    </ListItem>
  );
};

const toKubePkgList = (name: string, groupEnvDeployments: any) => {
  const list = {
    apiVersion: "octohelm.tech/v1alpha1",
    kind: "KubePkgList",
    items: map(
      orderBy(values(groupEnvDeployments || {}), (d) => d.spec.deploy?.kind),
      (item) => ({
        apiVersion: item.apiVersion,
        kind: item.kind,
        metadata: item.metadata,
        spec: item.spec
      })
    )
  };

  const file = new File(
    [JSON.stringify(list, null, 2)],
    `${name}.kubepkg.json`,
    {
      type: "application/json"
    }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = `${name}.kubepkg.json`;
  a.click();
};

export const GroupEnvDeploymentExport = () => {
  const groupEnvDeployments$ = GroupEnvDeploymentsProvider.use$();

  return (
    <IconButtonWithTooltip
      label={"导出配置"}
      onClick={() => {
        toKubePkgList(
          `${groupEnvDeployments$.envName}.${groupEnvDeployments$.groupName}`,
          groupEnvDeployments$.value
        );
      }}
    >
      <Download />
    </IconButtonWithTooltip>
  );
};

export const GroupEnvDeploymentList = () => {
  const groupEnvDeployments$ = GroupEnvDeploymentsProvider.use$();

  const groupEnvDeployments = useObservable(groupEnvDeployments$);

  const deployments = useMemo(
    () =>
      orderBy(values(groupEnvDeployments || {}), (d) => d.spec.deploy?.kind),
    [groupEnvDeployments]
  );

  return (
    <List>
      {map(deployments, (kubepkg) => {
        return (
          <Fragment key={groupEnvDeployments$.keyOf(kubepkg)}>
            <GroupEnvDeploymentListItem kubepkg={kubepkg} />
          </Fragment>
        );
      })}
    </List>
  );
};
