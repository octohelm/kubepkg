import { createDomain } from "../../layout";
import { getGroup, Group, putGroup } from "../../client/dashboard";
import { map as rxMap } from "rxjs/operators";
import { useRequest } from "@innoai-tech/reactutil";
import { useEffect } from "react";

export const GroupProvider = createDomain(
  ({ groupName }: { groupName: string }, use) => {
    const getGroup$ = useRequest(getGroup);
    const putGroup$ = useRequest(putGroup);

    const group$ = use(
      `groups/${groupName}`,
      { name: groupName } as Group,
      {
        get$: getGroup$,
        put$: putGroup$
      },
      (domain$) => domain$.get$.pipe(rxMap((resp) => resp.body)),
      (domain$) => domain$.put$.pipe(rxMap((resp) => resp.body))
    );

    useEffect(() => {
      group$.get$.next({ groupName });
    }, [groupName]);

    return group$;
  }
);
