import { createDomain } from "../../layout";
import { GroupProvider } from "../../group";
import { listKubepkg } from "../../client/dashboard";
import { useRequest } from "@nodepkg/runtime";
import { map as rxMap } from "rxjs";

export const GroupKubePkgProvider = createDomain(({}, use) => {
  const group$ = GroupProvider.use$();

  const list$ = useRequest(listKubepkg);

  return use(
    `/groups/${group$.value.name}/kubepkgs`,
    [] as typeof listKubepkg.TRespData,
    {
      groupName: group$.value.name,
      list$: list$,
    },
    (kubepkgs$) => kubepkgs$.list$.pipe(rxMap((resp) => resp.body))
  );
});
