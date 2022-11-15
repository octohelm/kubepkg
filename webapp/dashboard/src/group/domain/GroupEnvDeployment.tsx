import { createDomain } from "../../layout";
import {
  ApisKubepkgV1Alpha1KubePkg, KubepkgChannel, latestKubepkgs, listGroupEnvClusterDeployments,
  listGroupEnvDeployment,
  putGroupEnvDeployment
} from "../../client/dashboard";
import { useRequest } from "@innoai-tech/reactutil";
import { map as rxMap, tap } from "rxjs";
import { useEffect } from "react";
import { GroupEnvProvider } from "./GroupEnv";
import { map, mapValues, reduce } from "@innoai-tech/lodash";
import { channel, deploymentID, deploymentSettingID, kubepkgName, revision } from "./util";

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

      clusterList$: listGroupEnvClusterDeployments$,

      list$: listGroupEnvDeployment$,
      latest$: latest$,

      put$: putGroupEnvDeployment$,

      keyOf: (kpkg: ApisKubepkgV1Alpha1KubePkg): string => {
        return [
          `d${revision(kpkg)}`,
          `s${deploymentSettingID(kpkg)}`
        ].join("/");
      }
    },
    (groupEnvDeployments$) => groupEnvDeployments$.clusterList$.pipe(rxMap((resp) => {
      return reduce(
        resp.body,
        (ret, kpkg) => {
          const did = deploymentID(kpkg);

          const current = groupEnvDeployments$.value[did];

          return current ? ({
            ...ret,
            [did]: {
              ...current,
              status: kpkg.status
            }
          }) : ret;
        },
        groupEnvDeployments$.value
      );
    })),
    (groupEnvDeployments$) => groupEnvDeployments$.latest$.pipe(rxMap((resp) => {

      return mapValues(groupEnvDeployments$.value, (kpkg) => {
        const id = `${kubepkgName(kpkg)}@${channel(kpkg) || KubepkgChannel.DEV}`;
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
    })),
    (groupEnvDeployments$) =>
      groupEnvDeployments$.list$.pipe(
        tap((resp) => {
          const kubepkgNames = map(resp.body.data, (kpkg) => `${kubepkgName(kpkg)}@${channel(kpkg) || KubepkgChannel.DEV}`);

          groupEnvDeployments$.latest$.next({
            names: kubepkgNames
          });
        }),
        tap(() => {
          if (groupEnv$.value.cluster && groupEnv$.value.cluster.endpoint != "") {
            groupEnvDeployments$.clusterList$.next({
              groupName: groupEnvDeployments$.groupName,
              envName: groupEnvDeployments$.envName
            });
          }
        }),
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
      )
  );

  useEffect(() => {
    groupEnvDeployments$.list$.next({
      groupName: groupEnvDeployments$.groupName,
      envName: groupEnvDeployments$.envName,
      size: -1
    });
  }, [groupEnvDeployments$.groupName, groupEnvDeployments$.envName]);

  return groupEnvDeployments$;
});
