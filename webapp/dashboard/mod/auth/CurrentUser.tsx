import { onMounted } from "@nodepkg/runtime";
import { BehaviorSubject } from "@nodepkg/runtime/rxjs";
import { createProvider, useRequest } from "@nodepkg/runtime";

import {
  currentPermissions,
  currentUser,
  type RbacPermissions
} from "@webapp/dashboard/client/dashboard";
import { rx, subscribeUntilUnmount } from "@innoai-tech/vuekit";

export type UserWithPermissions = typeof currentUser.TRespData & {
  permissions?: RbacPermissions;
};

export const CurrentUserProvider = createProvider(
  () => {
    const currentUser$ = useRequest(currentUser);
    const currentPermissions$ = useRequest(currentPermissions);

    onMounted(() => {
      currentUser$.next();
      currentPermissions$.next();
    });

    const currentUserAndPermissions$ = new BehaviorSubject<UserWithPermissions>(
      {} as any
    );

    rx(
      currentUser$,
      subscribeUntilUnmount((resp) => {
        currentUserAndPermissions$.next({
          ...resp.body,
          permissions: currentUserAndPermissions$.value.permissions
        });
      })
    );

    rx(
      currentPermissions$,
      subscribeUntilUnmount((resp) => {
        currentUserAndPermissions$.next({
          ...currentUserAndPermissions$.value,
          permissions: resp.body
        });
      })
    );

    return currentUserAndPermissions$;
  },
  {
    name: "CurrentUser"
  }
);
