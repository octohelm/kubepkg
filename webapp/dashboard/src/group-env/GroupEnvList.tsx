import {
  useObservableState,
  useStateSubject,
  useObservableEffect
} from "@nodepkg/state";
import {
  AddCircleOutlineOutlined,
  SettingsOutlined
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from "@mui/material";
import { Fragment, useMemo } from "react";
import { useGroupEnvFormWithDialog } from "./GroupEnvForm";
import {
  Scaffold,
  IconButtonWithTooltip,
  stringAvatar,
  ListItemLink,
  Slot
} from "../layout";
import { tap } from "rxjs";
import { GroupEnvsProvider, GroupProvider } from "../group";
import type { GroupEnv } from "../client/dashboard";
import { Link } from "@nodepkg/router";
import { AccessControl } from "../auth";
import { map, orderBy } from "@innoai-tech/lodash";

const GroupEnvListItem = ({
                            groupEnv: initialGroupEnv
                          }: {
  groupEnv: GroupEnv;
}) => {
  const group$ = GroupProvider.use$();
  const groupEnv$ = useStateSubject(initialGroupEnv);
  const form$ = useGroupEnvFormWithDialog(initialGroupEnv);

  useObservableEffect(() =>
    form$.post$.pipe(
      tap((resp) => {
        groupEnv$.next((group) => ({
          ...group,
          ...resp.body
        }));
      })
    )
  );

  const groupEnv = useObservableState(groupEnv$);

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
          <Slot elem$={form$.dialog$.elements$} />
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

  const groupEnvs = useObservableState(groupEnvs$);

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
      <Slot elem$={form$.dialog$.elements$} />
    </AccessControl>
  );
};

export const GroupEnvMenu = () => {
  const groupEnvs$ = GroupEnvsProvider.use$();
  const groupEnvs = useObservableState(groupEnvs$);

  const envs = useMemo(
    () => orderBy(groupEnvs, (groupEnv) => groupEnv.envName),
    [groupEnvs]
  );

  return (
    <List>
      {map(envs, (groupEnv) => {
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
