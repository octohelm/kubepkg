import {
  useObservable,
  useStateSubject,
  useObservableEffect,
} from "@innoai-tech/reactutil";
import {
  AddCircleOutlineOutlined,
  SettingsOutlined,
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
import { Fragment } from "react";
import { useGroupEnvFormWithDialog } from "./GroupEnvForm";
import {
  Scaffold,
  IconButtonWithTooltip,
  stringAvatar,
  ListItemLink,
} from "../layout";
import { tap } from "rxjs/operators";
import { GroupEnvsProvider, GroupProvider } from "../group/domain";
import type { GroupEnv } from "../client/dashboard";
import { Link } from "react-router-dom";
import { AccessControl } from "../auth";

const GroupEnvListItem = ({
  groupEnv: initialGroupEnv,
}: {
  groupEnv: GroupEnv;
}) => {
  const group$ = GroupProvider.use$();
  const groupEnv$ = useStateSubject(initialGroupEnv);
  const form$ = useGroupEnvFormWithDialog(initialGroupEnv);

  useObservableEffect(
    () => [
      form$.post$.pipe(
        tap((resp) => {
          groupEnv$.next((group) => ({
            ...group,
            ...resp.body,
          }));
        })
      ),
    ],
    []
  );

  const groupEnv = useObservable(groupEnv$);

  return (
    <ListItem
      secondaryAction={
        <AccessControl op={form$}>
          <IconButtonWithTooltip
            edge="end"
            label="设置"
            onClick={(e: any) => {
              e.stopPropagation();
              form$.dialog$.next(true);
            }}
          >
            <SettingsOutlined />
          </IconButtonWithTooltip>
          {form$.dialog$.render()}
        </AccessControl>
      }
    >
      <Box
        sx={{ color: "inherit", textDecoration: "none" }}
        component={Link}
        to={`/groups/${group$.value.name}/envs/${groupEnv.envName}`}
      >
        <ListItemAvatar>
          <Avatar variant="rounded">{stringAvatar(groupEnv.envName)}</Avatar>
        </ListItemAvatar>
      </Box>
      <ListItemText
        primary={<Box>{`${groupEnv.envName}`}</Box>}
        secondary={
          <Box component="span" sx={{ display: "inline" }}>
            {groupEnv.desc}
          </Box>
        }
      />
    </ListItem>
  );
};

const GroupEnvList = () => {
  const groupEnvs$ = GroupEnvsProvider.use$();

  const groupEnvs = useObservable(groupEnvs$);

  if (!groupEnvs) {
    return null;
  }

  return (
    <List>
      {groupEnvs.map((groupEnv, i) => {
        return (
          <Fragment key={groupEnv.envID}>
            {i > 0 && <Divider component="li" />}
            <GroupEnvListItem groupEnv={groupEnv} />
          </Fragment>
        );
      })}
    </List>
  );
};

const GroupMainToolbar = () => {
  const form$ = useGroupEnvFormWithDialog();

  return (
    <AccessControl op={form$}>
      <IconButtonWithTooltip
        label={"创建环境"}
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

export const GroupEnvMenu = () => {
  const groupEnvs$ = GroupEnvsProvider.use$();

  const groupEnvs = useObservable(groupEnvs$);

  if (!groupEnvs) {
    return null;
  }

  return (
    <List>
      {groupEnvs.map((groupEnv) => {
        return (
          <ListItemLink
            key={groupEnv.envName}
            title={groupEnv.envName}
            to={`/groups/${groupEnvs$.groupName}/envs/${groupEnv.envName}`}
          />
        );
      })}
    </List>
  );
};

export const GroupEnvMain = () => {
  return (
    <Scaffold toolbar={<GroupMainToolbar />}>
      <GroupEnvList />
    </Scaffold>
  );
};
