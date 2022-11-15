import { createDomain } from "../../layout";
import { deleteKubepkgVersion, getKubepkgRevision, listKubepkgVersion } from "../../client/dashboard";
import { useRequest } from "@innoai-tech/reactutil";
import { map as rxMap } from "rxjs";

export const GroupKubePkgVersionProvider = createDomain(({
                                                           groupName,
                                                           name
                                                         }: {
  groupName: string,
  name: string,
}, use) => {
  const list$ = useRequest(listKubepkgVersion);
  const del$ = useRequest(deleteKubepkgVersion);
  const get$ = useRequest(getKubepkgRevision);

  return use(
    `groups/${groupName}/kubepkgs/${name}/versions?`,
    [] as typeof listKubepkgVersion.TRespData,
    {
      groupName: groupName,
      name: name,
      list$: list$,
      del$: del$,
      get$: get$
    },
    (kubepkgs$) => kubepkgs$.list$.pipe(rxMap((resp) => resp.body)),
    (kubepkgs$) => kubepkgs$.del$.pipe(rxMap((resp) => kubepkgs$.value.filter((k) => {
      return (!(k.version === resp.config.inputs.version || encodeURIComponent(k.version) === resp.config.inputs.version));
    })))
  );
});