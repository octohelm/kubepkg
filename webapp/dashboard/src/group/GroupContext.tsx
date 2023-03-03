import { useObservableState } from "@nodepkg/runtime";
import { Avatar, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import type { ReactNode } from "react";
import { useParams, Link } from "@nodepkg/router";
import { stringAvatar } from "../layout";
import {
  GroupProvider,
  GroupEnvsProvider,
  GroupAccessControlProvider,
} from "./domain";

export const GroupTitle = () => {
  const group$ = GroupProvider.use$();

  const group = useObservableState(group$)!;

  return (
    <ListItem component={Link} button={true} to={`/groups/${group.name}`}>
      <ListItemAvatar>
        <Avatar variant={"rounded"}>{stringAvatar(group.name)}</Avatar>
      </ListItemAvatar>
      <ListItemText primary={group.name} secondary={group.desc || "-"} />
    </ListItem>
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
      <GroupAccessControlProvider>
        <GroupEnvsProvider>{children}</GroupEnvsProvider>
      </GroupAccessControlProvider>
    </GroupProvider>
  );
};
