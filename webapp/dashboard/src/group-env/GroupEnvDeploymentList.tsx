import { last, map, orderBy, values } from "@innoai-tech/lodash";
import { Link as RouterLink } from "@nodepkg/router";
import {
  List,
  ListItem,
  ListItemText,
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
  revision,
  channel,
  deploymentRevision
} from "../group";
import { IconButtonWithTooltip, Slot } from "../layout";
import { Download } from "@mui/icons-material";
import { useGroupEnvDeploymentFormWithDialog } from "./GroupEnvDeployementForm";
import { Fragment, ReactNode } from "react";
import type { ApisKubepkgV1Alpha1KubePkg } from "../client/dashboard";
import { openAPISpecPath } from "../group";
import { useObservableState, useMemoObservable } from "@nodepkg/runtime";
import { map as rxMap } from "rxjs";
import { AccessControl } from "../auth";
import { useGroupEnvDeploymentHistoryFormWithDialog } from "./GroupEnvDeploymentHistory";

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
    <Stack component={"span"} spacing={0.5} sx={{ alignItems: "flex-end" }}>
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
                <Stack component={"span"} key={i} spacing={0.5}>
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

const canUpgrade = (kubepkg: ApisKubepkgV1Alpha1KubePkg): boolean =>
  (kubepkg as any)?.upgrade;

const isLatestUpgrade = (kubepkg: ApisKubepkgV1Alpha1KubePkg): boolean =>
  (kubepkg as any)?.upgrade?.latest;

const KubePkgHeading = ({
                          kubepkg
                        }: {
  kubepkg: ApisKubepkgV1Alpha1KubePkg;
}) => {
  const edit$ = useGroupEnvDeploymentFormWithDialog(kubepkg);
  const history$ = useGroupEnvDeploymentHistoryFormWithDialog(kubepkg);

  return (
    <Stack
      component={"span"}
      direction={"row"}
      spacing={1}
      sx={{
        fontFamily: "monospace",
        width: "100%",
        py: 0.5,
        justifyContent: "space-between"
      }}
    >
      <Stack component={"span"} sx={{ position: "relative" }}>
        <Box component={"span"}>
          <Stack
            component={"span"}
            direction={"row"}
            sx={{
              fontFamily: "monospace",
              fontSize: "0.6em",
              alignItems: "center",
              position: "absolute",
              top: "-1em"
            }}
            spacing={1}
          >
            <Tooltip
              placement={"left"}
              title={
                canUpgrade(kubepkg)
                  ? isLatestUpgrade(kubepkg)
                    ? "最新"
                    : "可更新"
                  : "未绑定更新通道"
              }
            >
              <Box
                component={"span"}
                sx={[
                  {
                    opacity: 0.8,
                    fontWeight: "bold"
                  },
                  (theme) => ({
                    color: canUpgrade(kubepkg)
                      ? isLatestUpgrade(kubepkg)
                        ? theme.palette.success.main
                        : theme.palette.warning.main
                      : "inherit"
                  })
                ]}
              >
                {`${kubepkgName(kubepkg)}`}
                <Box component={"span"} sx={{ opacity: 0.5 }}>
                  @
                </Box>
                {`${channel(kubepkg)}`}
              </Box>
            </Tooltip>
          </Stack>
        </Box>
        <Stack
          component={"span"}
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            "&:hover small": {
              visibility: "visible"
            }
          }}
        >
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
            component={"small"}
            direction="row"
            spacing={1}
            sx={{
              visibility: "hidden",
              opacity: 0.8,
              fontSize: "0.8em",
              "& a": {
                color: "inherit"
              }
            }}
          >
            <AccessControl op={edit$}>
              <Link
                href={"#"}
                onClick={(e) => {
                  e.preventDefault();
                  edit$.dialog$.next(true);
                }}
              >
                编辑
              </Link>
              <Slot elem$={edit$.dialog$.elements$} />
            </AccessControl>
            <AccessControl op={history$}>
              <Link
                href={"#"}
                onClick={(e) => {
                  e.preventDefault();
                  history$.dialog$.next(true);
                }}
              >
                历史部署
              </Link>
              <Slot elem$={history$.dialog$.elements$} />
            </AccessControl>
          </Stack>
        </Stack>
      </Stack>
      <Stack component={"span"} sx={{ position: "relative" }}>
        <Box
          component={"span"}
          sx={{
            position: "absolute",
            fontSize: "0.5em",
            opacity: 0.5,
            top: "-1em",
            right: 0
          }}
        >
          {`r${revision(kubepkg)}`}&nbsp;
          {`d${deploymentID(kubepkg)}`}&nbsp;
          {`s${deploymentSettingID(kubepkg)}`}
        </Box>
        <Box
          component={"span"}
          sx={{
            fontWeight: "bold",
            opacity: 0.5,
            textAlign: "right"
          }}
        >
          {kubepkg.spec.version}
        </Box>
      </Stack>
    </Stack>
  );
};

export const GroupEnvDeploymentListItem = ({
                                             kubepkg
                                           }: {
  kubepkg: ApisKubepkgV1Alpha1KubePkg;
}) => {
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
          </Stack>
        }
        secondary={
          <Stack spacing={1} component={"span"} direction={"row"}>
            <Box component={"span"} sx={{ display: "block", flex: 1 }}>
              <DeploymentEndpoints kubepkg={kubepkg} />
              <SpecStatus kubepkg={kubepkg} />
            </Box>
            <DeploymentConditions kubepkg={kubepkg} />
          </Stack>
        }
      />
    </ListItem>
  );
};

export const GroupEnvDeploymentExport = () => {
  const groupEnvDeployments$ = GroupEnvDeploymentsProvider.use$();

  return (
    <IconButtonWithTooltip
      title={"导出配置"}
      onClick={() => {
        window.open(groupEnvDeployments$.list$.toHref({
          groupName: groupEnvDeployments$.groupName,
          envName: groupEnvDeployments$.envName,
          size: -1,
          raw: false
        }), "_blank");
      }}
    >
      <Download />
    </IconButtonWithTooltip>
  );
};

export const GroupEnvDeploymentList = () => {
  const groupEnvDeployments$ = GroupEnvDeploymentsProvider.use$();

  const sortedDeployments$ = useMemoObservable(() =>
    groupEnvDeployments$.pipe(
      rxMap((groupEnvDeployments) =>
        orderBy(
          values(groupEnvDeployments || {}),
          [
            (d) => d.spec.deploy?.kind,
            (d) => d.metadata?.name
          ]
        )
      )
    )
  );

  const sortedDeployments = useObservableState(sortedDeployments$);

  return (
    <List>
      {map(sortedDeployments, (kubepkg) => {
        return (
          <Fragment key={deploymentRevision(kubepkg)}>
            <GroupEnvDeploymentListItem kubepkg={kubepkg} />
          </Fragment>
        );
      })}
    </List>
  );
};
