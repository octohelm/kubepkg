import { createDomain } from "../../layout";
import {
  ApisKubepkgV1Alpha1KubePkg, listGroupEnvClusterDeployments,
  listGroupEnvDeployment,
  putGroupEnvDeployment
} from "../../client/dashboard";
import { useRequest } from "@innoai-tech/reactutil";
import { map, tap } from "rxjs/operators";
import { useEffect } from "react";
import { GroupEnvProvider } from "./GroupEnv";
import { get, reduce } from "@innoai-tech/lodash";
import { annotationKey } from "./util";

const deploymentID = (kpkg: ApisKubepkgV1Alpha1KubePkg) => get(kpkg, [
  "metadata",
  "annotations",
  annotationKey("deploymentID")
]);

export const GroupEnvDeploymentsProvider = createDomain(({}, use) => {
  const groupEnv$ = GroupEnvProvider.use$();
  const putGroupEnvDeployment$ = useRequest(putGroupEnvDeployment);
  const listGroupEnvDeployment$ = useRequest(listGroupEnvDeployment);
  const listGroupEnvClusterDeployments$ = useRequest(listGroupEnvClusterDeployments);

  const groupEnvDeployments$ = use(
    `groups/${groupEnv$.value.groupName}/envs/${groupEnv$.value.envName}/deployments?`,
    {} as { [DeploymentID: string]: ApisKubepkgV1Alpha1KubePkg },
    {
      groupName: groupEnv$.value.groupName,
      envName: groupEnv$.value.envName,
      list$: listGroupEnvDeployment$,
      clusterList$: listGroupEnvClusterDeployments$,
      put$: putGroupEnvDeployment$,
      keyOf: (kpkg: ApisKubepkgV1Alpha1KubePkg): string => {
        return [
          `d${get(kpkg, [
            "metadata",
            "annotations",
            annotationKey("revision")
          ])}`,
          `d${get(kpkg, [
            "metadata",
            "annotations",
            annotationKey("deploymentSettingID")
          ])}`
        ].join("/");
      }
    },
    (groupEnvDeployments$) => groupEnvDeployments$.clusterList$.pipe(map((resp) => {
      return reduce(
        resp.body,
        (ret, kpkg) => {
          const id = deploymentID(kpkg);

          const current = groupEnvDeployments$.value[id] || kpkg;

          return ({
            ...ret,
            [deploymentID(current)]: {
              ...current,
              status: kpkg.status
            }
          });
        },
        groupEnvDeployments$.value
      );
    })),
    (groupEnvDeployments$) =>
      groupEnvDeployments$.list$.pipe(
        tap(() => {
          if (groupEnv$.value.cluster && groupEnv$.value.cluster.endpoint != "") {
            groupEnvDeployments$.clusterList$.next({
              groupName: groupEnvDeployments$.groupName,
              envName: groupEnvDeployments$.envName
            });
          }
        }),
        map((resp) =>
          reduce(
            resp.body.data,
            (ret, kpkg) => ({
              ...ret,
              [get(kpkg, [
                "metadata",
                "annotations",
                annotationKey("deploymentID")
              ])]: kpkg
            }),
            {}
          )
        )
      ),
    (groupEnvDeployments$) =>
      groupEnvDeployments$.put$.pipe(
        map((resp) => ({
          ...groupEnvDeployments$.value,
          [get(resp.body, [
            "metadata",
            "annotations",
            annotationKey("deploymentID")
          ])]: resp.body
        }))
      )
  );

  useEffect(() => {
    groupEnvDeployments$.list$.next({
      groupName: groupEnvDeployments$.groupName,
      envName: groupEnvDeployments$.envName
    });
  }, [groupEnvDeployments$.groupName, groupEnvDeployments$.envName]);

  return groupEnvDeployments$;
});
