import { get, isEmpty, map } from "@innoai-tech/lodash";
import { useObservable } from "@innoai-tech/reactutil";
import { List, ListItem, ListItemText, Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { GroupEnvDeploymentsProvider, GroupEnvProvider } from "../group";
import { IconButtonWithTooltip, Scaffold } from "../layout";
import { AccessControl } from "../auth";
import { AddCircleOutlineOutlined, EditOutlined } from "@mui/icons-material";
import { useGroupEnvDeploymentFormWithDialog } from "./GroupEnvDeployementForm";
import { Fragment } from "react";
import type { ApisKubepkgV1Alpha1KubePkg } from "../client/dashboard";

export const GroupEnvDeploymentListItem = ({
  id,
  kubepkg,
}: {
  id: string;
  kubepkg: ApisKubepkgV1Alpha1KubePkg;
}) => {
  const form$ = useGroupEnvDeploymentFormWithDialog(kubepkg);

  const kubepkgName = kubepkg.metadata?.name || id;
  const spec = kubepkg.spec;

  if (!spec.deploy) {
    return (
      <ListItem>
        <ListItemText primary={kubepkgName} secondary={spec.version} />
      </ListItem>
    );
  }

  return (
    <ListItem
      secondaryAction={
        <AccessControl op={form$}>
          {form$.dialog$.render()}
          <IconButtonWithTooltip
            edge="end"
            label={form$.dialog$.title}
            onClick={() => {
              form$.dialog$.next(true);
            }}
          >
            <EditOutlined />
          </IconButtonWithTooltip>
        </AccessControl>
      }
    >
      <ListItemText
        primary={
          <Box
            component={"span"}
            sx={{
              fontFamily: "monospace",
              lineHeight: 1,
              paddingTop: 0.5,
              paddingBottom: 0.5,
              display: "block",
            }}
          >
            <Box
              component={"span"}
              sx={{ display: "block", fontWeight: "bold" }}
            >
              {spec.deploy.kind}/{kubepkgName}@{spec.version}
            </Box>
            <Box
              component={"span"}
              sx={{
                lineHeight: 1,
                fontFamily: "monospace",
                fontSize: "0.6em",
                opacity: 0.6,
              }}
            >
              <Box component={"span"}>
                {" d"}
                {get(
                  kubepkg,
                  [
                    "metadata",
                    "annotations",
                    "kubepkg.innoai.tech/deploymentID",
                  ],
                  "-"
                )}
              </Box>
              <Box component={"span"}>
                {" r"}
                {get(
                  kubepkg,
                  ["metadata", "annotations", "kubepkg.innoai.tech/revision"],
                  "-"
                )}
              </Box>
              <Box component={"span"}>
                {" s"}
                {get(
                  kubepkg,
                  [
                    "metadata",
                    "annotations",
                    "kubepkg.innoai.tech/deploymentSettingID",
                  ],
                  "-"
                )}
              </Box>
            </Box>
          </Box>
        }
        secondary={
          <Box
            component={"span"}
            sx={{
              display: "block",
              paddingLeft: "2em",
            }}
          >
            <Box
              component={"span"}
              sx={{
                fontSize: "0.8em",
                display: "block",
                fontFamily: "monospace",
              }}
            >
              {map(spec.containers, (c, name) => {
                return (
                  <Box
                    key={name}
                    component={"span"}
                    sx={{ display: "inline-block", position: "relative" }}
                  >
                    <Box
                      component={"span"}
                      sx={{
                        opacity: 0.7,
                        fontSize: "0.6em",
                        position: "absolute",
                        top: -2,
                        left: 0,
                      }}
                    >
                      containers/{name}
                    </Box>
                    <Box
                      component={"span"}
                      sx={{
                        display: "block",
                        paddingTop: 0.5,
                        paddingBottom: 0.5,
                      }}
                    >
                      {`${c.image.name}${c.image.tag ? `:${c.image.tag}` : ""}${
                        c.image.digest ? `@${c.image.digest}` : ""
                      }`}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        }
      />
    </ListItem>
  );
};

export const GroupEnvDeploymentList = () => {
  const groupEnvDeployments$ = GroupEnvDeploymentsProvider.use$();
  const groupEnvDeployments = useObservable(groupEnvDeployments$);

  if (isEmpty(groupEnvDeployments)) {
    return null;
  }

  return (
    <List>
      {map(groupEnvDeployments, (kubepkg, id) => {
        return (
          <Fragment key={groupEnvDeployments$.keyOf(kubepkg)}>
            <GroupEnvDeploymentListItem id={id} kubepkg={kubepkg} />
          </Fragment>
        );
      })}
    </List>
  );
};

const GroupEnvDeploymentMainToolbar = () => {
  const form$ = useGroupEnvDeploymentFormWithDialog();

  return (
    <AccessControl op={form$}>
      <IconButtonWithTooltip
        label={"创建 KubePkg"}
        size="large"
        color="inherit"
        onClick={() => form$.dialog$.next(true)}
      >
        <AddCircleOutlineOutlined />
      </IconButtonWithTooltip>
      {form$.dialog$.render()}
    </AccessControl>
  );
};

export const GroupEnvDeploymentMain = () => {
  const params = useParams();

  return (
    <GroupEnvProvider groupName={params["group"]!} envName={params["env"]!}>
      <GroupEnvDeploymentsProvider>
        <Scaffold toolbar={<GroupEnvDeploymentMainToolbar />}>
          <GroupEnvDeploymentList />
        </Scaffold>
      </GroupEnvDeploymentsProvider>
    </GroupEnvProvider>
  );
};
