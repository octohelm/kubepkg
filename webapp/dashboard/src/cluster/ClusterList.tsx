import {
  useObservable,
  useRequest,
  Subscribe,
  useStateSubject,
} from "@innoai-tech/reactutil";
import {
  AddToDriveOutlined,
  SettingsOutlined,
  DriveFileRenameOutlineOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { Fragment, useEffect } from "react";
import { Cluster, listCluster } from "../client/dashboard";
import { useClusterFormWithDialog } from "./ClusterForm";
import { Scaffold, stringAvatar, useEpics } from "../layout";
import { IconButtonWithTooltip } from "../layout";
import { AccessControl } from "../auth";
import { useClusterFormRenameWithDialog } from "./ClusterFormRename";
import { map } from "rxjs/operators";

const ClusterListItem = ({ cluster: initialCluster }: { cluster: Cluster }) => {
  const cluster$ = useStateSubject<Cluster>(initialCluster);
  const clusterForm$ = useClusterFormWithDialog(initialCluster);
  const clusterRenameForm$ = useClusterFormRenameWithDialog(
    cluster$.value.name
  );

  useEpics(
    cluster$,
    (cluster$) =>
      clusterForm$.post$.pipe(
        map((resp) => ({
          ...cluster$.value,
          ...resp.body,
        }))
      ),
    (cluster$) =>
      clusterRenameForm$.post$.pipe(
        map((resp) => ({
          ...cluster$.value,
          ...resp.body,
        }))
      )
  );

  return (
    <>
      <ListItem
        secondaryAction={
          <>
            <AccessControl op={clusterRenameForm$}>
              <IconButtonWithTooltip
                edge="end"
                label="重命名"
                onClick={() => clusterRenameForm$.dialog$.next(true)}
              >
                <DriveFileRenameOutlineOutlined />
              </IconButtonWithTooltip>
              {clusterRenameForm$.dialog$.render()}
            </AccessControl>
            <AccessControl op={clusterForm$}>
              <IconButtonWithTooltip
                edge="end"
                label="设置"
                onClick={() => clusterForm$.dialog$.next(true)}
              >
                <SettingsOutlined />
              </IconButtonWithTooltip>
              {clusterForm$.dialog$.render()}
            </AccessControl>
          </>
        }
      >
        <Subscribe value$={cluster$}>
          {(cluster) => (
            <>
              <ListItemAvatar>
                <Avatar variant="rounded">{stringAvatar(cluster.name)}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={<Box>{`${cluster.name} | ${cluster.envType}`}</Box>}
                secondary={
                  <Box component="span" sx={{ display: "inline" }}>
                    {`${cluster.desc || "-"} | ${cluster.endpoint || "-"} | ${
                      cluster.netType
                    }`}
                  </Box>
                }
              />
            </>
          )}
        </Subscribe>
      </ListItem>
    </>
  );
};

const ClusterList = () => {
  const listCluster$ = useRequest(listCluster);

  useEffect(() => {
    listCluster$.next({});
  }, []);

  const resp = useObservable(listCluster$);

  if (!resp) {
    return null;
  }

  return (
    <List>
      {resp.body?.map((cluster, i) => {
        return (
          <Fragment key={cluster.clusterID}>
            {i > 0 && <Divider component="li" />}
            <ClusterListItem cluster={cluster} />
          </Fragment>
        );
      })}
    </List>
  );
};

const ClusterMainToolbar = () => {
  const clusterForm$ = useClusterFormWithDialog();

  return (
    <AccessControl op={clusterForm$}>
      <IconButtonWithTooltip
        label={"创建集群"}
        size="large"
        color="inherit"
        onClick={() => clusterForm$.dialog$.next(true)}
      >
        <AddToDriveOutlined />
      </IconButtonWithTooltip>
      {clusterForm$.dialog$.render()}
    </AccessControl>
  );
};

export const ClusterMain = () => {
  return (
    <Scaffold toolbar={<ClusterMainToolbar />}>
      <ClusterList />
    </Scaffold>
  );
};
