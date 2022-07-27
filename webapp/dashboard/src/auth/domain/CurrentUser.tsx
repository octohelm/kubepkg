import { currentPermissions, currentUser } from "../../client/dashboard";
import { createDomain, useProxy } from "../../layout";
import { useRequest } from "@innoai-tech/reactutil";
import { create } from "@innoai-tech/form";
import { map as rxMap } from "rxjs/operators";
import { useEffect } from "react";
import { has } from "@innoai-tech/lodash";

export interface User {
  accountID: string;
  accountType: string;
  nickname: string;
  adminRole: string;
  permissions?: { [k: string]: any[] };
}

const canAccess = (operationID: string, user: User) => {
  if (user.permissions) {
    if (has(user.permissions || {}, operationID)) {
      const exec = create(user.permissions[operationID]! as any)({
        root: user,
        schema: {}
      });
      return exec(0);
    }
    return true;
  }
  return false;
};

export const CurrentUserProvider = createDomain(({}, use) => {
  const currentUser$ = useRequest(currentUser);
  const currentPermissions$ = useRequest(currentPermissions);

  const user$ = use("currentUser", {} as User, {
      user$: currentUser$,
      permissions$: currentPermissions$
    },
    (domain$) =>
      domain$.user$.pipe(
        rxMap((resp) => ({
          ...domain$.value,
          ...resp.body
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
    user$.user$.next({});
    user$.permissions$.next({});
  }, []);

  return useProxy(user$, {
    canAccess: (op: Op) => canAccess(op.operationID, user$.value)
  });
});

export interface Op {
  operationID: string;
}
