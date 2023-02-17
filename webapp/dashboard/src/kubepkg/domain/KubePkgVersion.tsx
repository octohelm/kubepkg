import { createDomain } from "../../layout";
import {
  deleteKubepkgVersion,
  getKubepkgRevision,
  listKubepkgVersion,
} from "../../client/dashboard";
import { useRequest } from "@nodepkg/state";
import { map as rxMap } from "rxjs";

export interface KubepkgNameInfo {
  groupName: string;
  kubePkgName: string;
}

export const GroupKubePkgVersionProvider = createDomain(
  ({ groupName, kubePkgName }: KubepkgNameInfo, use) => {
    const list$ = useRequest(listKubepkgVersion);
    const del$ = useRequest(deleteKubepkgVersion);
    const get$ = useRequest(getKubepkgRevision);

    return use(
      `groups/${groupName}/kubepkgs/${kubePkgName}/versions?`,
      [] as typeof listKubepkgVersion.TRespData,
      {
        groupName: groupName,
        kubePkgName: kubePkgName,
        list$: list$,
        del$: del$,
        get$: get$,
      },
      (kubepkgs$) => kubepkgs$.list$.pipe(rxMap((resp) => resp.body)),
      (kubepkgs$) =>
        kubepkgs$.del$.pipe(
          rxMap((resp) =>
            kubepkgs$.value.filter((k) => {
              return !(
                k.version === resp.config.inputs.version ||
                encodeURIComponent(k.version) === resp.config.inputs.version
              );
            })
          )
        )
    );
  }
);
