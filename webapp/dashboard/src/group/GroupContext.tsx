import { Subscribe } from "@innoai-tech/reactutil";
import { Avatar, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import type { ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { stringAvatar } from "../layout";
import { GroupProvider } from "./domain/Group";
import { GroupEnvsProvider } from "./domain/GroupEnv";

export const GroupTitle = () => {
  const group$ = GroupProvider.use$();

  return (
    <Subscribe value$={group$}>
      {(group) => {
        return (
          <ListItem component={Link} button={true} to={`/groups/${group.name}`}>
            <ListItemAvatar>
              <Avatar variant={"rounded"}>{stringAvatar(group.name)}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={group.name} secondary={group.desc || "-"} />
          </ListItem>
        );
      }}
    </Subscribe>
  );
};

export const GlobalGroupProvider = ({
  groupName,
  children,
}: {
  groupName?: string;
  children: ReactNode;
}) => {
  const params = useParams();

  return (
    <GroupProvider groupName={groupName || params["group"] || ""}>
      <GroupEnvsProvider>{children}</GroupEnvsProvider>
    </GroupProvider>
  );
};
