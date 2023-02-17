import { createDomain } from "../../layout";
import {
  ApisKubepkgV1Alpha1KubePkg,
  KubepkgChannel,
  latestKubepkgs,
  listGroupEnvClusterDeployments,
  listGroupEnvDeployment,
  putGroupEnvDeployment
} from "../../client/dashboard";
import { useRequest } from "@nodepkg/state";
import { ignoreElements, map as rxMap, merge, tap } from "rxjs";
import { GroupEnvProvider } from "./GroupEnv";
import { map, mapValues, pick, reduce } from "@innoai-tech/lodash";
import { channel, deploymentID, kubepkgName } from "./util";
import { useEffect } from "react";

export const GroupEnvDeploymentsProvider = createDomain(({}, use) => {
  const groupEnv$ = GroupEnvProvider.use$();

  const putGroupEnvDeployment$ = useRequest(putGroupEnvDeployment);
  const listGroupEnvDeployment$ = useRequest(listGroupEnvDeployment);
  const latest$ = useRequest(latestKubepkgs);
  const listGroupEnvClusterDeployments$ = useRequest(listGroupEnvClusterDeployments);

  const groupEnvDeployments$ = use(
    `groups/${groupEnv$.value.groupName}/envs/${groupEnv$.value.envName}/deployments?`,
    {} as { [DeploymentID: string]: ApisKubepkgV1Alpha1KubePkg },
    {
      groupName: groupEnv$.value.groupName,
      envName: groupEnv$.value.envName,

      latest$: latest$,
      put$: putGroupEnvDeployment$,
      list$: listGroupEnvDeployment$,
      clusterList$: listGroupEnvClusterDeployments$
    },
    (groupEnvDeployments$) =>
      groupEnvDeployments$.clusterList$.pipe(
        rxMap((resp) => {
          return reduce(
            resp.body,
            (ret, kpkg) => {
              const did = deploymentID(kpkg);

              const existed = groupEnvDeployments$.value[did];

              return {
                ...ret,
                [did]: existed
                  ? {
                    ...existed,
                    status: kpkg.status
                  }
                  : {
                    apiVersion: kpkg.apiVersion,
                    kind: kpkg.kind,
                    metadata: pick(kpkg.metadata, [
                      "name",
                      "namespace",
                      "labels",
                      "annotations"
                    ]),
                    spec: kpkg.spec,
                    status: kpkg.status
                    // TODO diff version for db and real cluster
                  }
              };
            },
            groupEnvDeployments$.value
          );
        })
      ),
    (groupEnvDeployments$) =>
      groupEnvDeployments$.latest$.pipe(
        rxMap((resp) => {
          return mapValues(groupEnvDeployments$.value, (kpkg) => {
            const id = `${kubepkgName(kpkg)}@${
              channel(kpkg) || KubepkgChannel.DEV
            }`;
            const s = resp.body[id];

            if (s) {
              return {
                ...kpkg,
                upgrade: {
                  latest: s.version === kpkg.spec.version
                }
              };
            }

            return kpkg;
          });
        })
      ),
    (groupEnvDeployments$) =>
      groupEnvDeployments$.list$.pipe(
        rxMap((resp) =>
          reduce(
            resp.body.data,
            (ret, kpkg) => ({
              ...ret,
              [deploymentID(kpkg)]: kpkg
            }),
            {}
          )
        )
      ),
    (groupEnvDeployments$) =>
      groupEnvDeployments$.put$.pipe(
        rxMap((resp) => ({
          ...groupEnvDeployments$.value,
          [deploymentID(resp.body)]: resp.body
        }))
      ),

    (groupEnvDeployments$) =>
      merge(groupEnvDeployments$.list$, groupEnvDeployments$.put$).pipe(
        tap(() => {
          const kubepkgNames = map(
            groupEnvDeployments$.value,
            (kpkg) => `${kubepkgName(kpkg)}@${channel(kpkg)}`
          );

          if (kubepkgNames.length > 0) {
            groupEnvDeployments$.latest$.next({
              names: kubepkgNames
            });
          }
        }),
        tap(() => {
          if (
            groupEnv$.value.cluster &&
            groupEnv$.value.cluster.endpoint != ""
          ) {
            groupEnvDeployments$.clusterList$.next({
              groupName: groupEnvDeployments$.groupName,
              envName: groupEnvDeployments$.envName
            });
          }
        }),
        ignoreElements()
      )
  );

  useEffect(() => {
    const fetch = () =>
      groupEnvDeployments$.list$.next({
        groupName: groupEnvDeployments$.groupName,
        envName: groupEnvDeployments$.envName,
        raw: true,
        size: -1
      });

    fetch();
  }, [groupEnvDeployments$.groupName, groupEnvDeployments$.envName]);

  return groupEnvDeployments$;
});
