import { createDomain } from "../../layout";
import {
  ApisKubepkgV1Alpha1KubePkg,
  listGroupEnvDeployment,
  putGroupEnvDeployment,
} from "../../client/dashboard";
import { useRequest } from "@innoai-tech/reactutil";
import { map } from "rxjs";
import { useEffect } from "react";
import { GroupEnvProvider } from "./GroupEnv";
import { get, reduce } from "@innoai-tech/lodash";
import { annotationKey } from "./util";

export const GroupEnvDeploymentsProvider = createDomain(({}, use) => {
  const groupEnv$ = GroupEnvProvider.use$();
  const listGroupEnvDeployment$ = useRequest(listGroupEnvDeployment);
  const putGroupEnvDeployment$ = useRequest(putGroupEnvDeployment);

  const groupEnvDeployments$ = use(
    `groups/${groupEnv$.value.groupName}/envs/${groupEnv$.value.envName}/deployments?`,
    {} as { [DeploymentID: string]: ApisKubepkgV1Alpha1KubePkg },
    {
      groupName: groupEnv$.value.groupName,
      envName: groupEnv$.value.envName,
      list$: listGroupEnvDeployment$,
      put$: putGroupEnvDeployment$,
      keyOf: (kpkg: ApisKubepkgV1Alpha1KubePkg): string => {
        return [
          `d${get(kpkg, [
            "metadata",
            "annotations",
            annotationKey("revision"),
          ])}`,
          `d${get(kpkg, [
            "metadata",
            "annotations",
            annotationKey("deploymentSettingID"),
          ])}`,
        ].join("/");
      },
    },
    (groupEnvDeployments$) =>
      groupEnvDeployments$.list$.pipe(
        map((resp) =>
          reduce(
            resp.body.data,
            (ret, kpkg) => ({
              ...ret,
              [get(kpkg, [
                "metadata",
                "annotations",
                annotationKey("deploymentID"),
              ])]: kpkg,
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
            annotationKey("deploymentID"),
          ])]: resp.body,
        }))
      )
  );

  useEffect(() => {
    groupEnvDeployments$.list$.next({
      groupName: groupEnvDeployments$.groupName,
      envName: groupEnvDeployments$.envName,
    });
  }, [groupEnvDeployments$.groupName, groupEnvDeployments$.envName]);

  return groupEnvDeployments$;
});
