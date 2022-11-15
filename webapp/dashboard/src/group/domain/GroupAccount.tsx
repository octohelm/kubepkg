import { createSubject } from "../../layout";
import { GroupProvider } from "./Group";
import {
  deleteGroupAccount,
  listGroupAccount,
  putGroupAccount,
} from "../../client/dashboard";
import { useRequest } from "@innoai-tech/reactutil";
import { ignoreElements, map, tap } from "rxjs/operators";

export const GroupAccountProvider = createSubject(({}, use) => {
  const group$ = GroupProvider.use$();
  const listAccount$ = useRequest(listGroupAccount);
  const putGroupAccount$ = useRequest(putGroupAccount);
  const deleteGroupAccount$ = useRequest(deleteGroupAccount);

  return use(
    {} as typeof listGroupAccount.TRespData,
    {
      groupName: group$.value.name,
      list$: listAccount$,
      del$: deleteGroupAccount$,
      put$: putGroupAccount$,
    },
    (accounts$) =>
      accounts$.put$.pipe(
        tap(() => {
          accounts$.list$.next({
            groupName: group$.value.name,
          });
        }),
        ignoreElements()
      ),
    (accounts$) =>
      accounts$.del$.pipe(
        tap(() => {
          accounts$.list$.next({
            groupName: group$.value.name,
          });
        }),
        ignoreElements()
      ),
    (accounts$) => accounts$.list$.pipe(map((resp) => resp.body))
  );
});
