import {
  useObservable,
  useRequest,
  Subscribe,
  useStateSubject
} from "@innoai-tech/reactutil";
import {
  AddToDriveOutlined,
  SettingsOutlined,
  DriveFileRenameOutlineOutlined
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Divider,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme
} from "@mui/material";
import { Fragment, useEffect } from "react";
import { Cluster, ClusterInstanceStatus, ClusterNetType, getClusterStatus, listCluster } from "../client/dashboard";
import { useClusterFormWithDialog } from "./ClusterForm";
import { Scaffold, stringAvatar, useEpics } from "../layout";
import { IconButtonWithTooltip } from "../layout";
import { AccessControl } from "../auth";
import { useClusterFormRenameWithDialog } from "./ClusterFormRename";
import { ignoreElements, map, tap } from "rxjs/operators";
import { interval } from "rxjs";

export const ClusterStatus = ({ cluster }: { cluster: Cluster }) => {
  const clusterStatus$ = useStateSubject<ClusterInstanceStatus>({} as any);
  const request$ = useRequest(getClusterStatus);
  const theme = useTheme();

  useEpics(clusterStatus$,
    () => {
      request$.next({ name: cluster.clusterID });

      return interval(10 * 1000)
        .pipe(
          tap(() => {
            request$.next({ name: cluster.clusterID });
          }),
          ignoreElements()
        );
    },
    () => request$.pipe(map((resp) => resp.body)),
    () => request$.error$.pipe(map(() => ({ id: "-", ping: "-" })))
  );

  return (
    <Subscribe value$={clusterStatus$}>
      {(status) => (
        <Box
          component={"small"}
          sx={{
            opacity: 0.7,
            color: status.ping == "-" ? theme.palette.error.main : theme.palette.success.main
          }}
        >
          {status.id} {status.ping}
        </Box>
      )}
    </Subscribe>
  );
};


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
          ...resp.body
        }))
      ),
    (cluster$) =>
      clusterRenameForm$.post$.pipe(
        map((resp) => ({
          ...cluster$.value,
          ...resp.body
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
          {(cluster) => {
            const canAccess = cluster.netType == ClusterNetType.DIRECT && cluster.endpoint;

            return (
              <>
                <ListItemAvatar>
                  <Avatar variant="rounded">{stringAvatar(cluster.name)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box component="span">
                      <Box
                        sx={{
                          display: "inline-block",
                          fontFamily: "monospace",
                          paddingRight: 1
                        }}>
                        {`${cluster.envType}/${cluster.name}`}
                      </Box>
                      {canAccess && <ClusterStatus cluster={cluster} />}
                    </Box>
                  }
                  secondary={
                    <Box component="span">
                      <Box component="span">
                        {cluster.desc || "-"} {" "}
                      </Box>
                      {(canAccess) ? (
                        <Link target={"_blank"} href={cluster.endpoint}>
                          {cluster.netType}
                        </Link>
                      ) : (
                        <Box component="span">
                          {cluster.netType}
                        </Box>
                      )}
                    </Box>
                  }
                />
              </>
            );
          }}
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
