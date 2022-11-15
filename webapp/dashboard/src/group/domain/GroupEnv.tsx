import { createDomain } from "../../layout";
import {
  bindGroupEnvCluster,
  GroupEnv, GroupEnvWithCluster,
  listGroupEnv,
  putGroupEnv,
  unbindGroupEnvCluster
} from "../../client/dashboard";
import { useRequest } from "@innoai-tech/reactutil";
import { map } from "rxjs";
import { useEffect } from "react";
import { GroupProvider } from "./Group";
import { find, pick } from "@innoai-tech/lodash";

export const GroupEnvsProvider = createDomain(({}, use) => {
  const group$ = GroupProvider.use$();
  const listGroupEnv$ = useRequest(listGroupEnv);
  const putGroupEnv$ = useRequest(putGroupEnv);

  const groupEnv$ = use(
    `groups/${group$.value.name}/envs`,
    [] as GroupEnv[],
    {
      groupName: group$.value.name,
      list$: listGroupEnv$,
      put$: putGroupEnv$
    },
    (groupEnvs$) => groupEnvs$.list$.pipe(map((resp) => resp.body)),
    (groupEnvs$) =>
      groupEnvs$.put$.pipe(
        map((resp) =>
          groupEnvs$.value.map((groupEnv) => {
            if (groupEnv.envID === resp.body.envID) {
              return resp.body;
            }
            return groupEnv;
          })
        )
      )
  );

  useEffect(() => {
    groupEnv$.list$.next({ groupName: groupEnv$.groupName });
  }, [groupEnv$.groupName]);

  return groupEnv$;
});

export const GroupEnvProvider = createDomain(
  ({ groupName, envName }: { groupName: string; envName: string }, use) => {
    const groupEnvs$ = GroupEnvsProvider.use$();

    const bindCluster$ = useRequest(bindGroupEnvCluster);
    const unbindCluster$ = useRequest(unbindGroupEnvCluster);

    return use(
      `groups/${groupName}/envs/${envName}?`,
      { groupName, envName } as { groupName: string; envName: string } & Partial<GroupEnvWithCluster>,
      {
        bindCluster$: bindCluster$,
        unbindCluster$: unbindCluster$
      },
      (groupEnv$) => bindCluster$.pipe(map((resp) => {
        return {
          ...pick(groupEnv$.value, ["groupName", "envName"]),
          ...resp.body
        };
      })),
      (groupEnv$) => unbindCluster$.pipe(map((resp) => {
        return {
          ...pick(groupEnv$.value, ["groupName", "envName"]),
          ...resp.body
        };
      })),
      (groupEnv$) => groupEnvs$.pipe(map((groupEnvs) => {
        return {
          ...pick(groupEnv$.value, ["groupName", "envName"]),
          ...(find(groupEnvs, (groupEnv) => groupEnv.envName == envName) || {})
        };
      }))
    );
  }
);
