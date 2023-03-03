import { createDomain } from "../../layout";
import { getGroup, Group, putGroup } from "../../client/dashboard";
import { map as rxMap } from "rxjs";
import { useRequest } from "@nodepkg/runtime";
import { ReactNode, useEffect, useMemo } from "react";
import { AccessControlProvider, createCanAccess } from "../../auth";

export const GroupProvider = createDomain(
  ({ groupName }: { groupName: string }, use) => {
    const getGroup$ = useRequest(getGroup);
    const putGroup$ = useRequest(putGroup);

    const group$ = use(
      `groups/${groupName}`,
      { name: groupName } as Group,
      {
        get$: getGroup$,
        put$: putGroup$,
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

export const GroupAccessControlProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const group$ = GroupProvider.use$();

  const canAccessWithGroup = useMemo(
    () => createCanAccess(group$.value.groupID),
    [group$.value.groupID]
  );

  return (
    <AccessControlProvider
      value={{
        canAccess: canAccessWithGroup,
      }}
    >
      {children}
    </AccessControlProvider>
  );
};
