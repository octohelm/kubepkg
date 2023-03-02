import { useObservableState, useRequest } from "@nodepkg/state";
import { AddCircleOutlined } from "@mui/icons-material";
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { Box } from "@mui/material";
import { Fragment, useEffect } from "react";
import { listCluster } from "../client/dashboard";
import { IconButtonWithTooltip, stringAvatar } from "../layout";

export const ClusterMenuList = ({
  onSelect,
}: {
  onSelect: (clusterID: string) => void;
}) => {
  const listCluster$ = useRequest(listCluster);

  useEffect(() => {
    listCluster$.next(undefined);
  }, []);

  const resp = useObservableState(listCluster$);

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
                  title="选择集群"
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
                      paddingRight: 1,
                    }}
                  >
                    {`${cluster.envType}/${cluster.name}`}
                  </Box>
                }
                secondary={<Box component={"span"}>{`${cluster.desc}`}</Box>}
              />
            </ListItem>
          </Fragment>
        );
      })}
    </List>
  );
};
