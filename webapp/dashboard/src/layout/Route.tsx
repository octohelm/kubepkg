import { isFunction, map } from "@innoai-tech/lodash";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  useMemo,
  useContext,
  ReactElement,
  cloneElement,
  createContext,
} from "react";
import {
  Link as RouterLink,
  Route,
  Outlet,
  useMatch,
  PathRouteProps,
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
  children,
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
            children: fromRoutes(c.props.children, p),
          });
        }
      }
    }
  }

  return list;
};

const RoutesContext = createContext({
  path: "/",
  meta: {} as Partial<RouteMetaProps>,
  children: [] as ReturnType<typeof fromRoutes>,
});

export const useRoutes = () => useContext(RoutesContext);

const RoutesProvider = ({
  path,
  meta,
  routes,
  children,
}: {
  path: string;
  meta: RouteMetaProps;
  routes: ReactElement[];
  children: ReactElement;
}) => {
  const r = useRoutes();

  const ctx = useMemo(() => {
    const p = cleanPath(`${r.path || "/"}${path ? `/${path}` : ""}`);

    return {
      path: p,
      meta: meta.root ? meta : r.meta,
      children: meta.root ? fromRoutes(routes, p) : r.children,
    };
  }, [r, routes, meta.root]);

  return (
    <RoutesContext.Provider value={ctx}>{children}</RoutesContext.Provider>
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
        key: i,
      })
    );

    const meta = {
      title: p.title,
      icon: p.icon,
      root: p.root,
      menu: p.menu,
    };

    return (
      <Route
        {...p}
        element={
          <RouteMeta {...meta}>
            <RoutesProvider path={p.path} meta={meta} routes={subRoutes}>
              {element}
            </RoutesProvider>
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
            [prop as any]: args,
          };
          return builder;
        };
      }

      return (arg: any): any => {
        props = {
          ...props,
          [prop as any]: arg,
        };
        return builder;
      };
    },
  }) as RouteBuilder<P>;

  return builder;
};

export const path = (path: string) => {
  return createRouteBuilder<
    RouteMetaProps & Omit<PathRouteProps, "index" | "path" | "children">
  >({
    path,
  } as any);
};

export const index = () => {
  return createRouteBuilder<
    RouteMetaProps & Omit<PathRouteProps, "index" | "path" | "children">
  >({ index: true } as any);
};

export interface ListItemLinkProps {
  icon?: ReactElement;
  title: ReactElement | string;
  to: string;
}

export const ListItemLink = (props: ListItemLinkProps) => {
  const { icon, title, to } = props;

  const matched = useMatch(to);

  if (icon) {
    return (
      <ListItem
        button={true}
        component={RouterLink}
        to={to}
        selected={!!matched}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={title} />
      </ListItem>
    );
  }

  return (
    <ListItem component={RouterLink} to={to} selected={!!matched}>
      <ListItemIcon />
      <ListItemText secondary={title} />
    </ListItem>
  );
};
