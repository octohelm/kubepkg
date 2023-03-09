import { Slot } from "@nodepkg/runtime";
import { ReactNode, useMemo } from "react";
import { Divider, Box, Drawer, List } from "@mui/material";
import {
  generatePath,
  getMetadata,
  RouteInfo,
  RouteObject,
  useMatches
} from "@nodepkg/router";
import { map as rxMap, Observable, of } from "rxjs";
import { get, isEmpty, map, some } from "@innoai-tech/lodash";
import { ListItemLink } from "src/layout";

const findInfoSubject = (
  route?: RouteObject
): undefined | Observable<RouteInfo> => {
  if (!route) {
    return;
  }

  const meta = getMetadata(route);

  if (meta) {
    if (meta.info$) {
      return meta.info$ as Observable<RouteInfo>;
    }

    if (meta.children && meta.children.length != 0) {
      if (meta.children.length == 1) {
        return findInfoSubject(meta.children[0]);
      }
      return findInfoSubject(meta.children.find((c: RouteObject) => !c.path));
    }
  }

  return;
};

export const AwaitRouteInfo = ({
                                 route,
                                 children
                               }: {
  route: RouteObject;
  children: (info: RouteInfo) => ReactNode;
}) => {
  const infoElement$ = useMemo(
    () =>
      findInfoSubject(route)?.pipe(
        rxMap((info) => (
          <>
            {children({
              ...getMetadata(route),
              ...info
            })}
          </>
        ))
      ) ?? of(null),
    [route]
  );
  return <Slot elem$={infoElement$} />;
};

const findRelatedMatch = (matches: ReturnType<typeof useMatches>) => {
  for (const m of matches) {
    if (some(get(m, ["handle", "children"], []), (v) => v.path == "")) {
      return m;
    }
  }
  return matches[0]!;
};

export const TopNavDrawer = ({
                               width,
                               open = true
                             }: {
  width: number;
  open?: boolean;
}) => {
  const matches = useMatches();
  const matchRoute = findRelatedMatch(matches);

  if (!get(matchRoute, ["handle", "children"])) {
    return null;
  }

  return (
    <Drawer
      open={open}
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        ["& .MuiDrawer-paper"]: {
          width,
          position: "relative",
          boxSizing: "border-box"
        }
      }}
    >
      <AwaitRouteInfo route={matchRoute}>
        {(info) => {
          return (
            <>
              {info.title && (
                <>
                  <List>{info.title}</List>
                  <Divider />
                </>
              )}
              {info.children && (
                <List>
                  {map(info.children, (subRoute, i) => (
                    <AwaitRouteInfo key={i} route={subRoute}>
                      {(sub) => {
                        if (sub.pathname?.endsWith("/")) {
                          return null;
                        }

                        if (isEmpty(sub.children)) {
                          return (
                            <ListItemLink
                              icon={sub.icon}
                              title={sub.title ?? <>{sub.pathname}</>}
                              strict={false}
                              to={generatePath(sub.pathname, matchRoute.params)}
                            />
                          );
                        }

                        return (
                          <>
                            <ListItemLink
                              icon={sub.icon}
                              title={sub.title ?? <>{sub.pathname}</>}
                              to={generatePath(sub.pathname, matchRoute.params)}
                              strict
                            />
                            {map(sub.children, (subRoute, i) => (
                              <AwaitRouteInfo key={i} route={subRoute}>
                                {(sub) => {
                                  if (sub.menu) {
                                    return <>{sub.menu}</>;
                                  }

                                  if (sub.pathname?.endsWith("/")) {
                                    return null;
                                  }

                                  try {
                                    const to = generatePath(
                                      sub.pathname,
                                      matchRoute.params
                                    );

                                    return (
                                      <ListItemLink
                                        icon={sub.icon}
                                        title={sub.title ?? <>{sub.pathname}</>}
                                        to={to}
                                        strict
                                      />
                                    );
                                  } catch (_) {
                                    return null;
                                  }
                                }}
                              </AwaitRouteInfo>
                            ))}
                          </>
                        );
                      }}
                    </AwaitRouteInfo>
                  ))}
                </List>
              )}
            </>
          );
        }}
      </AwaitRouteInfo>
      <Box flex={1} />
    </Drawer>
  );
};
