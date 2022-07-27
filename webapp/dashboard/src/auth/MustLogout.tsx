import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router";
import { TokenProvider } from "./domain";

export const MustLogout = ({ children }: { children?: ReactNode }) => {
  const token$ = TokenProvider.use$();

  if (!token$.validateToken(token$.value?.accessToken)) {
    if (children) {
      return <>{children}</>;
    }
    return <Outlet />;
  }

  return <Navigate to={"/"} replace={true} />;
};
