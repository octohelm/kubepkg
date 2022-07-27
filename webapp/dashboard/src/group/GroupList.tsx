import {
  useObservable,
  useRequest,
  useStateSubject,
  useObservableEffect,
} from "@innoai-tech/reactutil";
import { GroupAddOutlined, SettingsOutlined } from "@mui/icons-material";
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
import { Group, listGroup } from "../client/dashboard";
import { useGroupFormWithDialog } from "./GroupForm";
import { Scaffold, stringAvatar } from "../layout";
import { tap } from "rxjs/operators";
import { IconButtonWithTooltip } from "../layout";
import { AccessControl } from "../auth";

const GroupListItem = ({ group: initialGroup }: { group: Group }) => {
  const group$ = useStateSubject(initialGroup);

  const form$ = useGroupFormWithDialog(initialGroup);

  useObservableEffect(
    () => [
      form$.post$.pipe(
        tap((resp) => {
          group$.next((group) => ({
            ...group,
            ...resp.body,
          }));
        })
      ),
    ],
    []
  );

  const group = useObservable(group$);

  return (
    <>
      <ListItem
        secondaryAction={
          <AccessControl op={form$}>
            <IconButtonWithTooltip
              edge="end"
              label="设置"
              onClick={() => form$.dialog$.next(true)}
            >
              <SettingsOutlined />
            </IconButtonWithTooltip>
            {form$.dialog$.render()}
          </AccessControl>
        }
      >
        <ListItemAvatar>
          <Avatar variant="rounded">{stringAvatar(group.name)}</Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={<Box>{`${group.name}`}</Box>}
          secondary={
            <Box component="span" sx={{ display: "inline" }}>
              {group.desc}
            </Box>
          }
        />
      </ListItem>
    </>
  );
};

const GroupList = () => {
  const listGroup$ = useRequest(listGroup);

  useEffect(() => {
    listGroup$.next({});
  }, []);

  const resp = useObservable(listGroup$);

  if (!resp) {
    return null;
  }

  return (
    <List>
      {resp.body?.map((group, i) => {
        return (
          <Fragment key={group.groupID}>
            {i > 0 && <Divider component="li" />}
            <GroupListItem group={group} />
          </Fragment>
        );
      })}
    </List>
  );
};

const GroupMainToolbar = () => {
  const form$ = useGroupFormWithDialog();

  return (
    <AccessControl op={form$}>
      <IconButtonWithTooltip
        label={"创建组织"}
        size="large"
        color={"inherit"}
        onClick={() => form$.dialog$.next(true)}
      >
        <GroupAddOutlined />
      </IconButtonWithTooltip>
      {form$.dialog$.render()}
    </AccessControl>
  );
};

export const GroupMain = () => {
  return (
    <Scaffold toolbar={<GroupMainToolbar />}>
      <GroupList />
    </Scaffold>
  );
};
