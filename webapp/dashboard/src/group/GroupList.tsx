import {
  useObservableState,
  useMemoObservable,
  useRequest,
  useStateSubject,
  useObservableEffect
} from "@nodepkg/runtime";
import { DeleteOutlined, GroupAddOutlined, SettingsOutlined } from "@mui/icons-material";
import {
  Stack
} from "@mui/material";
import { useEffect } from "react";
import { Group, listGroup } from "../client/dashboard";
import { useGroupDelDialog, useGroupPutDialog } from "./GroupActions";
import { Slot, Scaffold } from "../layout";
import { map, merge, tap } from "rxjs";
import { IconButtonWithTooltip } from "../layout";
import { AccessControl } from "../auth";
import { GroupCard } from "./GroupCard";
import { isEmpty } from "@innoai-tech/lodash";

const GroupSettings = ({ group: initialGroup }: { group: Group }) => {
  const group$ = useStateSubject(initialGroup);

  const put$ = useGroupPutDialog(initialGroup);
  const del$ = useGroupDelDialog({ groupName: initialGroup.name });

  useObservableEffect(() => merge(
    del$.pipe(tap(() => {
      group$.next({} as any);
    })),
    put$.pipe(
      tap((resp) => {
        group$.next((group) => ({
          ...group,
          ...resp.body
        }));
      })
    )
  ));

  const groupElements$ = useMemoObservable(() => group$.pipe(map((group) => isEmpty(group) ? null : (
    <GroupCard
      group={group}
      actions={(
        <>
          <AccessControl op={put$}>
            <IconButtonWithTooltip
              title="设置"
              onClick={() => put$.dialog$.next(true)}
            >
              <SettingsOutlined />
            </IconButtonWithTooltip>
            <Slot elem$={put$.dialog$.elements$} />
          </AccessControl>
          <AccessControl op={del$}>
            <IconButtonWithTooltip
              title="删除"
              onClick={() => del$.dialog$.next(true)}
            >
              <DeleteOutlined />
            </IconButtonWithTooltip>
            <Slot elem$={del$.dialog$.elements$} />
          </AccessControl>
        </>
      )}
    />
  ))));

  return <Slot elem$={groupElements$} />;
};

const GroupList = () => {
  const listGroup$ = useRequest(listGroup);

  useEffect(() => {
    listGroup$.next(undefined);
  }, []);

  const resp = useObservableState(listGroup$);

  if (!resp) {
    return null;
  }

  return (
    <Stack direction={"row"} spacing={0} sx={{ flexWrap: "wrap", gap: 2 }}>
      {resp.body?.map((group) => {
        return (
          <GroupSettings
            key={group.groupID}
            group={group}
          />
        );
      })}
    </Stack>
  );
};

const GroupMainToolbar = () => {
  const form$ = useGroupPutDialog();

  return (
    <AccessControl op={form$}>
      <IconButtonWithTooltip
        title={"创建组织"}
        size="large"
        color={"inherit"}
        onClick={() => form$.dialog$.next(true)}
      >
        <GroupAddOutlined />
      </IconButtonWithTooltip>
      <Slot elem$={form$.dialog$.elements$} />
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
