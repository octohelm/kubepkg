import { Subscribe, useObservable, useRequest, useStateSubject } from "@innoai-tech/reactutil";
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
  Typography
} from "@mui/material";
import { Fragment, useEffect } from "react";
import type { GroupRobot } from "../client/dashboard";

import { IconButtonWithTooltip, NotificationProvider, Scaffold, stringAvatar, useDialog, useProxy } from "../layout";
import { AccessControl } from "../auth";
import { useGroupRobotFormWithDialog } from "./GroupRobotForm";
import { AddModerator, RefreshOutlined } from "@mui/icons-material";
import { GroupProvider, GroupRobotProvider } from "./domain";
import { GroupRoleType, refreshGroupRobotToken } from "../client/dashboard";
import { map as rxMap, tap } from "rxjs/operators";
import copy from "copy-to-clipboard";


const useGroupRobotTokenRefresh = () => {
  const notification$ = NotificationProvider.use$();

  const refreshGroupRobotToken$ = useRequest(refreshGroupRobotToken);

  const theme = useTheme();

  const token$ = useStateSubject<typeof refreshGroupRobotToken.TRespData>({
    accessToken: "-"
  } as any);

  const dialog$ = useDialog({
    title: "Robot 访问凭证",
    onConfirm: () => dialog$.next(false),
    content: (
      <Box>
        <Subscribe value$={token$}>
          {(token) => (
            <Box component={"pre"} onClick={() => {
              copy(token.accessToken);
              notification$.notify("已复制到剪贴板");
            }} sx={{
              backgroundColor: theme.palette.action.hover,
              padding: theme.spacing(1, 1),
              borderRadius: 1,
              overflowY: "scroll"
            }}>
              <code>
                {token.accessToken}
              </code>
            </Box>
          )}
        </Subscribe>
        <Typography variant="caption">
          请妥善保管
        </Typography>
      </Box>
    )
  });

  return useProxy(token$, {
      operationID: refreshGroupRobotToken$.operationID,
      refresh$: refreshGroupRobotToken$,
      dialog$: dialog$
    },
    (token$) => token$.refresh$.pipe(
      rxMap((resp) => ({
        ...resp.body
      })),
      tap(() => {
        token$.dialog$.next(true);
      })
    )
  );
};


const GroupRobotListItem = ({ robot }: { robot: GroupRobot }) => {
  const token$ = useGroupRobotTokenRefresh();
  const group$ = GroupProvider.use$();

  return (
    <>
      <ListItem
        secondaryAction={
          <AccessControl op={token$}>
            {token$.dialog$.render()}
            <IconButtonWithTooltip
              edge="end"
              label={token$.dialog$.title}
              onClick={() => {
                token$.refresh$.next({
                  groupName: group$.value.name,
                  robotID: robot.accountID,
                  body: {
                    roleType: GroupRoleType.MEMBER,
                    expiresIn: 30 * 24 * 60 * 60
                  }
                });
              }}
            >
              <RefreshOutlined />
            </IconButtonWithTooltip>
          </AccessControl>
        }
      >
        <ListItemAvatar>
          <Avatar variant="rounded">{stringAvatar(robot.name)}</Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={<Box>{`${robot.name}`}</Box>}
          secondary={
            <Box component="span" sx={{ display: "inline" }}>
              {robot.accountID}
            </Box>
          }
        />
      </ListItem>
    </>
  );
};

const GroupRobotList = () => {
  const robots$ = GroupRobotProvider.use$();

  useEffect(() => {
    robots$.list$.next({
      groupName: robots$.groupName
    });
  }, []);

  const accountDataList = useObservable(robots$);

  return (
    <List>
      {accountDataList?.data?.map((robot, i) => {
        return (
          <Fragment key={robot.accountID}>
            {i > 0 && <Divider component="li" />}
            <GroupRobotListItem robot={robot} />
          </Fragment>
        );
      })}
    </List>
  );
};

const GroupRobotMainToolbar = () => {
  const form$ = useGroupRobotFormWithDialog();

  return (
    <AccessControl op={form$}>
      <IconButtonWithTooltip
        label={form$.dialog$.title}
        size="large"
        color={"inherit"}
        onClick={() => form$.dialog$.next(true)}
      >
        <AddModerator />
      </IconButtonWithTooltip>
      {form$.dialog$.render()}
    </AccessControl>
  );
};

export const GroupRobotMain = () => {
  return (
    <GroupRobotProvider>
      <Scaffold toolbar={<GroupRobotMainToolbar />}>
        <GroupRobotList />
      </Scaffold>
    </GroupRobotProvider>
  );
};
