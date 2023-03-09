import {
  useObservableState,
  useStateSubject,
  useObservableEffect
} from "@nodepkg/runtime";
import {
  AddCircleOutlineOutlined,
  DeleteOutlined,
  SettingsOutlined
} from "@mui/icons-material";
import {
  List,
  Stack
} from "@mui/material";
import { useMemo } from "react";
import { useGroupEnvDelDialog, useGroupEnvPutDialog } from "./GroupEnvActions";
import {
  IconButtonWithTooltip,
  ListItemLink,
  Slot
} from "../layout";
import { tap } from "rxjs";
import { GroupEnvsProvider, GroupProvider } from "../group";
import type { GroupEnv } from "../client/dashboard";
import { AccessControl } from "../auth";
import { map, orderBy } from "@innoai-tech/lodash";
import { GroupEnvCard } from "./GroupEnvCard";

const GroupEnvSettings = ({
                            groupEnv: initialGroupEnv
                          }: {
  groupEnv: GroupEnv;
}) => {
  const group$ = GroupProvider.use$();
  const groupEnv$ = useStateSubject(initialGroupEnv);

  const put$ = useGroupEnvPutDialog(initialGroupEnv);
  const del$ = useGroupEnvDelDialog({ groupName: group$.value.name, envName: initialGroupEnv.envName });

  useObservableEffect(() =>
    put$.pipe(
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
    <GroupEnvCard
      groupName={group$.value.name}
      groupEnv={groupEnv}
      actions={(
        <>
          <AccessControl op={put$}>
            <IconButtonWithTooltip
              title="设置"
              onClick={(e: any) => {
                e.stopPropagation();
                put$.dialog$.next(true);
              }}
            >
              <SettingsOutlined />
            </IconButtonWithTooltip>
            <Slot elem$={put$.dialog$.elements$} />
          </AccessControl>
          <AccessControl op={del$}>
            <IconButtonWithTooltip
              title="删除"
              onClick={(e: any) => {
                e.stopPropagation();
                del$.dialog$.next(true);
              }}
            >
              <DeleteOutlined />
            </IconButtonWithTooltip>
            <Slot elem$={del$.dialog$.elements$} />
          </AccessControl>
        </>
      )}
    />
  );
};

export const GroupEnvList = () => {
  const groupEnvs$ = GroupEnvsProvider.use$();

  const groupEnvs = useObservableState(groupEnvs$);

  if (!groupEnvs) {
    return null;
  }

  return (
    <Stack direction="row" spacing={0} sx={{ flexWrap: "wrap", gap: 2 }}>
      {groupEnvs.map((groupEnv) => {
        return (
          <GroupEnvSettings key={groupEnv.envID} groupEnv={groupEnv} />
        );
      })}
    </Stack>
  );
};

export const GroupEnvMainToolbar = () => {
  const put$ = useGroupEnvPutDialog();

  return (
    <AccessControl op={put$}>
      <IconButtonWithTooltip
        title={"创建环境"}
        size="large"
        color="inherit"
        onClick={() => put$.dialog$.next(true)}
      >
        <AddCircleOutlineOutlined />
      </IconButtonWithTooltip>
      <Slot elem$={put$.dialog$.elements$} />
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
    <List dense>
      {map(envs, (groupEnv) => {
        return (
          <ListItemLink
            key={groupEnv.envName}
            title={groupEnv.envName}
            to={`/groups/${groupEnvs$.groupName}/envs/${groupEnv.envName}`}
            strict
          />
        );
      })}
    </List>
  );
};
