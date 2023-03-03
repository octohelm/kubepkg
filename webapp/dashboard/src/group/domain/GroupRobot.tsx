import { createSubject } from "../../layout";
import { GroupProvider } from "./Group";
import {
  createGroupRobot,
  deleteGroupAccount,
  listGroupRobot,
  refreshGroupRobotToken,
} from "../../client/dashboard";
import { useRequest } from "@nodepkg/runtime";
import { map as rxMap, ignoreElements, tap } from "rxjs";

export const GroupRobotProvider = createSubject(({}, use) => {
  const group$ = GroupProvider.use$();

  const listAccount$ = useRequest(listGroupRobot);
  const createGroupRobot$ = useRequest(createGroupRobot);
  const token$ = useRequest(refreshGroupRobotToken);
  const deleteGroupRobot$ = useRequest(deleteGroupAccount);

  return use(
    {} as typeof listGroupRobot.TRespData,
    {
      groupName: group$.value.name,
      list$: listAccount$,
      create$: createGroupRobot$,
      del$: deleteGroupRobot$,
      token$: token$,
    },
    (accounts$) =>
      accounts$.create$.pipe(
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
    (accounts$) => accounts$.list$.pipe(rxMap((resp) => resp.body))
  );
});
