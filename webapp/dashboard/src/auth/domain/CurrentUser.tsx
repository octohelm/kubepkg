import { currentPermissions, currentUser } from "../../client/dashboard";
import { createDomain } from "../../layout";
import { useRequest } from "@innoai-tech/reactutil";
import { map as rxMap } from "rxjs/operators";
import { useEffect } from "react";

export interface User {
  permissions?: { [k: string]: any[] };
  accountID: string;
  accountType: string;
  nickname: string;
  adminRole: string;
  groupRoles: { [k: string]: any[] };
}

export const CurrentUserProvider = createDomain(({}, use) => {
  const currentUser$ = useRequest(currentUser);
  const currentPermissions$ = useRequest(currentPermissions);

  const user$ = use(
    "currentUser",
    {} as User,
    {
      user$: currentUser$,
      permissions$: currentPermissions$,
    },
    (domain$) =>
      domain$.user$.pipe(
        rxMap((resp) => ({
          ...domain$.value,
          ...resp.body,
        }))
      ),
    (domain$) =>
      domain$.permissions$.pipe(
        rxMap((resp) => ({
          ...domain$.value,
          permissions: resp.body,
        }))
      )
  );

  useEffect(() => {
    user$.user$.next({});
    user$.permissions$.next({});
  }, []);

  return user$;
});

export interface Op {
  operationID: string;
}