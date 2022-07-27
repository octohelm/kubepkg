import { AuthTokenPatcher } from "./TokenPatcher";
import { Outlet, useLocation, useNavigate } from "react-router";
import { ReactNode, useRef } from "react";
import { useObservableEffect } from "@innoai-tech/reactutil";
import { tap } from "rxjs";
import { stringifySearch } from "@innoai-tech/fetcher";
import { CurrentUserProvider, Op, TokenProvider } from "./domain";

export const AccessControl = ({
  op,
  children,
}: {
  op: Op;
  children: ReactNode;
}) => {
  const user$ = CurrentUserProvider.use$();

  if (!user$.canAccess(op)) {
    return null;
  }

  return <>{children}</>;
};

export const MustLogon = ({ children }: { children?: ReactNode }) => {
  const token$ = TokenProvider.use$();
  const location = useLocation();
  const nav = useNavigate();
  const locationRef = useRef(location);

  useObservableEffect(() => {
    return token$.pipe(
      tap((token) => {
        if (!token$.validateToken(token?.accessToken)) {
          nav(
            `/login${stringifySearch({
              redirect_uri: `${locationRef.current.pathname}${locationRef.current.search}`,
            })}`,
            {
              replace: true,
            }
          );
        }
      })
    );
  }, []);

  if (token$.validateToken(token$.value?.accessToken)) {
    return (
      <AuthTokenPatcher>
        <CurrentUserProvider>{children || <Outlet />}</CurrentUserProvider>
      </AuthTokenPatcher>
    );
  }

  return null;
};
