import { Subscribe } from "@nodepkg/runtime";
import { Box, Stack } from "@mui/material";
import { Link, LinkOff } from "@mui/icons-material";
import { GroupEnvProvider } from "../group";
import {
  IconButtonWithTooltip,
  Slot,
  useDialog,
  useEpics
} from "../layout";
import { AccessControl } from "../auth";
import { map } from "rxjs";
import { ClusterMenuList } from "../cluster";

export const useGroupEnvClusterBindDialog = () => {
  const groupEnv$ = GroupEnvProvider.use$();

  const action = "绑定集群";

  const dialog$ = useDialog({
    title: `${action}`,
    action: `${action}`,
    content: (
      <ClusterMenuList
        onSelect={(clusterID) =>
          groupEnv$.bindCluster$.next({
            groupName: groupEnv$.value.groupName,
            envName: groupEnv$.value.envName,
            clusterID: clusterID
          })
        }
      />
    )
  });

  useEpics(dialog$, () => groupEnv$.bindCluster$.pipe(map(() => false)));

  return dialog$;
};

export const useGroupEnvClusterUnbindDialog = () => {
  const groupEnv$ = GroupEnvProvider.use$();

  const action = "解绑集群";

  const dialog$ = useDialog({
    title: `${action}`,
    action: `${action}`,
    content: <Box>确定解绑集群？</Box>,
    onConfirm: () => {
      groupEnv$.unbindCluster$.next({
        groupName: groupEnv$.value.groupName,
        envName: groupEnv$.value.envName,
        clusterID: groupEnv$.value.cluster?.clusterID || "0"
      });
    }
  });

  useEpics(dialog$, () => groupEnv$.unbindCluster$.pipe(map(() => false)));

  return dialog$;
};

export const GroupEnvCluster = () => {
  const groupEnv$ = GroupEnvProvider.use$();
  const bindDialog$ = useGroupEnvClusterBindDialog();
  const unbindDialog$ = useGroupEnvClusterUnbindDialog();


  return (
    <Subscribe value$={groupEnv$}>
      {(groupEnv) => {
        if (!(groupEnv?.cluster)) {
          return (
            <Stack direction={"row"} spacing={1} sx={{ alignItems: "center" }}>
              <Box sx={{ flex: 1 }} />
              <Box component={"small"} sx={{ opacity: 0.6 }}>
                未关联集群
              </Box>
              <AccessControl op={groupEnv$.bindCluster$}>
                <IconButtonWithTooltip
                  title="关联集群"
                  onClick={() => bindDialog$.next(true)}
                >
                  <Link />
                </IconButtonWithTooltip>
                <Slot elem$={bindDialog$.elements$} />
              </AccessControl>
            </Stack>
          );
        }

        return (
          <Stack direction={"row"} spacing={1} sx={{ alignItems: "center" }}>
            <Box sx={{ flex: 1 }} />
            <Box component={"small"} sx={{ opacity: 0.6 }}>
              {groupEnv.namespace}.{groupEnv.cluster.name}
            </Box>
            <AccessControl op={groupEnv$.unbindCluster$}>
              <IconButtonWithTooltip
                title="解绑集群"
                onClick={() => unbindDialog$.next(true)}
              >
                <LinkOff />
              </IconButtonWithTooltip>
              <Slot elem$={unbindDialog$.elements$} />
            </AccessControl>
          </Stack>
        );
      }}
    </Subscribe>
  );
};
