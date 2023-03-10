import { currentPermissions, currentUser } from "src/client/dashboard";
import { createDomain, useRequest } from "@nodepkg/runtime";
import { map as rxMap } from "rxjs";
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
      permissions$: currentPermissions$
    },
    (domain$) =>
      domain$.user$.pipe(
        rxMap((resp) => ({
          ...domain$.value,
          ...(resp.body as any)
        }))
      ),
    (domain$) =>
      domain$.permissions$.pipe(
        rxMap((resp) => ({
          ...domain$.value,
          permissions: resp.body
        }))
      )
  );

  useEffect(() => {
    user$.user$.next(undefined);
    user$.permissions$.next(undefined);
  }, []);

  return user$;
});

export interface Op {
  operationID: string;
}
