import { createDomain } from "../../layout";
import { GroupEnv, listGroupEnv, putGroupEnv } from "../../client/dashboard";
import { useRequest } from "@innoai-tech/reactutil";
import { map } from "rxjs/operators";
import { useEffect } from "react";
import { GroupProvider } from "./Group";

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
      put$: putGroupEnv$,
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

    return use(
      `groups/${groupName}/envs/${envName}`,
      { groupName, envName } as { groupName: string; envName: string },
      {}
    );
  }
);
