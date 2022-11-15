import {
  useObservable,
  useRequest
} from "@innoai-tech/reactutil";
import { AddCircleOutlined } from "@mui/icons-material";
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from "@mui/material";
import { Box } from "@mui/system";
import { Fragment, useEffect } from "react";
import { listCluster } from "../client/dashboard";
import { IconButtonWithTooltip, stringAvatar } from "../layout";

export const ClusterMenuList = ({ onSelect }: { onSelect: (clusterID: string) => void }) => {
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
      {resp.body?.map((cluster) => {
        return (
          <Fragment key={cluster.clusterID}>
            <ListItem
              secondaryAction={
                <IconButtonWithTooltip
                  edge="end"
                  label="选择集群"
                  onClick={() => onSelect(cluster.clusterID)}
                >
                  <AddCircleOutlined />
                </IconButtonWithTooltip>
              }
            >
              <ListItemAvatar>
                <Avatar variant="rounded">{stringAvatar(cluster.name)}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box
                    component={"span"}
                    sx={{
                      display: "inline-block",
                      fontFamily: "monospace",
                      paddingRight: 1
                    }}>
                    {`${cluster.envType}/${cluster.name}`}
                  </Box>
                }
                secondary={
                  <Box
                    component={"span"}
                  >
                    {`${cluster.desc}`}
                  </Box>
                }
              />
            </ListItem>
          </Fragment>
        );
      })}
    </List>
  );
};
