import type { UserWithPermissions } from "./CurrentUser";
import { has, get } from "@nodepkg/runtime/lodash";
import {
  defaultExpressionFactory,
  createProvider,
  t,
  component$,
  rx,
  type VNodeChild
} from "@nodepkg/runtime";
import { CurrentUserProvider } from "./CurrentUser";
import { GroupRoleType } from "@webapp/dashboard/client/dashboard";
import { cloneVNode } from "@nodepkg/runtime/vue";

export interface Op {
  operationID: string;
}

export const createCanAccess =
  (resolveGroupID?: () => string) =>
    (operationID: string, user: UserWithPermissions) => {
      if (user.permissions) {
        if (has(user.permissions || {}, operationID)) {
          const exec = defaultExpressionFactory.create(
            user.permissions[operationID]! as any
          )({
            root: resolveGroupID
              ? {
                ...user,
                groupRole: get(user.groupRoles, [resolveGroupID()])
              }
              : user,
            schema: {}
          });

          return !!exec(0);
        }
        return true;
      }
      return false;
    };

export const AccessControlProvider = createProvider(
  () => ({
    canAccess: createCanAccess()
  }),
  {
    name: "AccessControl"
  }
);

export const AccessControl = component$(
  {
    op: t.custom<Op>(),
    renderWithDisabled: t.boolean().optional(),
    $default: t.custom<VNodeChild>().optional()
  },
  (props, { slots, render }) => {
    const { canAccess } = AccessControlProvider.use();
    const user$ = CurrentUserProvider.use();

    return rx(
      user$,
      render((user) => {
        const ok = canAccess(props.op.operationID, user);

        if (!ok) {
          if (props.renderWithDisabled) {
            const children = slots.default?.() ?? [];

            return (
              <>
                {children.map((c) =>
                  cloneVNode(c, {
                    disabled: true
                  })
                )}
              </>
            );
          }

          return null;
        }

        return slots.default?.();
      })
    );
  }
);

export const MustAdmin = component$(
  {
    $default: t.custom<VNodeChild>().optional()
  },
  ({}, { slots, render }) => {
    const user$ = CurrentUserProvider.use();

    return rx(
      user$,
      render((user) => {
        if (user.adminRole && user.adminRole != GroupRoleType.GUEST) {
          return slots.default?.();
        }
        return null;
      })
    );
  }
);
