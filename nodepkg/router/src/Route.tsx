import { isFunction, map } from "@innoai-tech/lodash";
import {
  useMemo,
  useContext,
  ReactElement,
  cloneElement,
  createContext
} from "react";
import {
  Route,
  Outlet,
  PathRouteProps
} from "react-router-dom";

export interface RouteMetaProps {
  root: boolean;
  icon: ReactElement;
  title: ReactElement | string;
  menu?: ReactElement;
}

const cleanPath = (p: string = "") => {
  return p.replace(/\/+/g, "/");
};

const RouteMeta = ({
                     children
                   }: RouteMetaProps & {
  children: ReactElement;
}) => {
  return children;
};

const fromRoutes = (routes: ReactElement[], from = "/"): RouteInfo[] => {
  const list = [];

  if (routes) {
    for (const c of routes) {
      if (c.props.path && c.props.element) {
        if (c.props.element.props.title || c.props.element.props.menu) {
          const p = cleanPath(`${from}/${c.props.path}`);

          list.push({
            path: p,
            title: c.props.element.props.title || "",
            icon: c.props.element.props.icon,
            root: c.props.element.props.root,
            menu: c.props.element.props.menu,
            children: fromRoutes(c.props.children, p)
          });
        }
      }
    }
  }

  return list;
};

const RouteContext = createContext({
  path: "/",
  meta: {} as Partial<RouteMetaProps>,
  children: [] as ReturnType<typeof fromRoutes>
});

export const useRouteContext = () => useContext(RouteContext);

const RouteContextProvider = ({
                                path,
                                meta,
                                routes,
                                children
                              }: {
  path: string;
  meta: RouteMetaProps;
  routes: ReactElement[];
  children: ReactElement;
}) => {
  const r = useRouteContext();

  const ctx = useMemo(() => {
    const p = cleanPath(`${r.path || "/"}${path ? `/${path}` : ""}`);

    return {
      path: p,
      meta: meta.root ? meta : r.meta,
      parent: r,
      children: meta.root ? fromRoutes(routes, p) : r.children
    };
  }, [r, routes, meta.root]);

  return (
    <RouteContext.Provider value={ctx}>
      {children}
    </RouteContext.Provider>
  );
};

interface RouteInfo extends RouteMetaProps {
  path: string;
  children: RouteInfo[];
}

export type RouteBuilder<P extends any> = {
  [k in keyof P]-?: (arg: P[k]) => RouteBuilder<P>;
} & {
  (): JSX.Element;
} & {
  children: (...args: Array<RouteBuilder<P> | JSX.Element>) => RouteBuilder<P>;
};

const createRouteBuilder = <P extends {}>(initials: Partial<P> = {}) => {
  let props = initials as P;

  const render = () => {
    const { children, ...p } = props as any;

    const element = p.element || <Outlet />;

    const subRoutes = map(children || [], (fn, i) =>
      cloneElement(isFunction(fn) ? fn() : fn, {
        key: i
      })
    );

    const meta = {
      title: p.title,
      icon: p.icon,
      root: p.root,
      menu: p.menu
    };

    return (
      <Route
        {...p}
        element={
          <RouteMeta {...meta}>
            <RouteContextProvider path={p.path} meta={meta} routes={subRoutes}>
              {element}
            </RouteContextProvider>
          </RouteMeta>
        }
      >
        {p.index ? null : subRoutes}
      </Route>
    );
  };

  const builder = new Proxy(render, {
    get(_, prop) {
      if (prop === "children") {
        return (...args: any[]): any => {
          props = {
            ...props,
            [prop as any]: args
          };
          return builder;
        };
      }

      return (arg: any): any => {
        props = {
          ...props,
          [prop as any]: arg
        };
        return builder;
      };
    }
  }) as RouteBuilder<P>;

  return builder;
};

export const path = (path: string) => {
  return createRouteBuilder<
    RouteMetaProps & Omit<PathRouteProps, "index" | "path" | "children">
  >({
    path
  } as any);
};

export const index = () => {
  return createRouteBuilder<
    RouteMetaProps & Omit<PathRouteProps, "index" | "path" | "children">
  >({ index: true } as any);
};
