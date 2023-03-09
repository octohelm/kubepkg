import type { ReactElement } from "react";
import type { RouteObject } from "react-router";
import { Slot } from "@nodepkg/runtime";
import {
  BehaviorSubject,
  Observable,
  of,
  from,
  distinctUntilChanged,
  switchMap,
  tap,
  map as rxMap
} from "rxjs";

export interface RouteInfo {
  pathname: string;
  title?: ReactElement | string;
  icon?: ReactElement;
  menu?: ReactElement;
  children?: RouteObject[];
}

export interface Metadata {
  pathname: string;
  info$: Observable<RouteInfo>;
  children?: RouteObject[];
}

export const getMetadata = (route: RouteObject): Metadata | null => {
  return route.handle ?? null;
};

export const processRoutes = (routes: RouteObject[], parent = ""): any[] => {
  return routes.map((r) => {
    const pathname = [parent, r.path].join("/").replaceAll("//", "/");

    const children = r.children ? processRoutes(r.children, pathname) : undefined;

    r.handle = {
      pathname: pathname,
      children
    };

    if (r.element) {
      const element = r.element as ReactElement;

      if (element) {
        const fetchRoute = (element.type as any)
          .fetch as () => Promise<RouteInfo>;
        if (fetchRoute) {
          const info$ = new BehaviorSubject<RouteInfo>({ pathname: "-" });

          r.handle.info$ = info$.pipe(
            // fetch once
            switchMap((v) => {
              if (v.pathname != "-") {
                return of(v);
              }
              return from(fetchRoute()).pipe(
                tap((ret) => {
                  info$.next(ret as any);
                })
              );
            }),
            distinctUntilChanged()
          );

          r.element = (
            <Slot
              elem$={r.handle.info$.pipe(
                rxMap(({ default: Comp }) => <Comp />)
              )}
            />
          );
        }
      }
    }

    return {
      ...r,
      children
    };
  });
};
