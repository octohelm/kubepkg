import { AuthTokenPatcher } from "./TokenPatcher";
import { Outlet, useLocation, useNavigate } from "@nodepkg/router";
import { ReactNode, useRef } from "react";
import { useObservableEffect } from "@nodepkg/runtime";
import { tap } from "rxjs";
import { stringifySearch } from "@innoai-tech/fetcher";
import { CurrentUserProvider, Op, TokenProvider, User } from "./domain";
import { createProvider } from "../layout";
import { get, has, isFunction } from "@innoai-tech/lodash";
import { create } from "@innoai-tech/form";

export const createCanAccess =
  (groupID?: string) => (operationID: string, user: User) => {
    if (user.permissions) {
      if (has(user.permissions || {}, operationID)) {
        const exec = create(user.permissions[operationID]! as any)({
          root: groupID
            ? {
              ...user,
              groupRole: get(user.groupRoles, [groupID])
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

export const AccessControlProvider = createProvider({
  canAccess: createCanAccess()
});

export const AccessControl = ({
                                op,
                                children
                              }: {
  op: Op;
  children: ReactNode | ((ok: boolean) => ReactNode);
}) => {
  const user$ = CurrentUserProvider.use$();
  const { canAccess } = AccessControlProvider.use();
  const ok = canAccess(op.operationID, user$.value);

  if (isFunction(children)) {
    return <>{children(ok)}</>;
  }

  if (!ok) {
    return null;
  }
  return <>{children}</>;
};

export const MustLogon = ({ children }: { children?: ReactNode }) => {
  const token$ = TokenProvider.use$();
  const location = useLocation();
  const nav = useNavigate();
  const locationRef = useRef(location);

  useObservableEffect(() =>
    token$.pipe(
      tap((token) => {
        if (!token$.validateToken(token?.accessToken)) {
          nav(
            `/login${stringifySearch({
              redirect_uri: `${locationRef.current.pathname}${locationRef.current.search}`
            })}`,
            {
              replace: true
            }
          );
        }
      })
    )
  );

  if (token$.validateToken(token$.value?.accessToken)) {
    return (
      <AuthTokenPatcher>
        <CurrentUserProvider>{children || <Outlet />}</CurrentUserProvider>
      </AuthTokenPatcher>
    );
  }

  return null;
};