import { Box, Icon, TextButton } from "@nodepkg/ui";
import { t, component, useRoute, RouterLink } from "@nodepkg/runtime";
import { shallowRef } from "@nodepkg/runtime/vue";
import {
  groupBy,
  map,
  partition,
  get,
  isFunction
} from "@nodepkg/runtime/lodash";

const routeMeta = (r: any, name: string, fallback?: any) => {
  const meta = r.component?.meta ?? {};
  return get(meta, [name], fallback);
};

const renderMeta = (
  r: any,
  name: string,
  render: (v: any) => JSX.Element | null,
  fallback?: () => JSX.Element | null
): JSX.Element | null => {
  const v = routeMeta(r, name);

  if (!isFunction(v)) {
    return render(v);
  }

  return <Async loader={v} render={render} fallback={fallback} />;
};

const Async = component(
  {
    loader: t.custom<() => Promise<any>>(),
    render: t.custom<(v: any) => JSX.Element | null>(),
    fallback: t.custom<() => JSX.Element | null>().optional()
  },
  (props) => {
    const r = shallowRef((props.loader as any)["__loaded"]);

    // ugly load direct
    props.loader().then((mod) => {
      r.value = mod.default;

      Object.assign(props.loader, {
        __loaded: mod.default
      });
    });

    return () => {
      return (r.value ? props.render(r.value) : undefined) ?? props.fallback?.() ?? null;
    };
  }
);

export const TopNav = component(() => {
  const route = useRoute();

  const base = route.fullPath
    .split("/")
    .slice(0, (route.matched[0]?.path ?? "/").split("/").length)
    .join("/");

  const matchedRoutes = route.matched[0]?.children
    .filter((v) => v.path)
    .map((r) => ({
      ...r,
      fullPath: `${base}${r.path.startsWith("/") ? r.path : `/${r.path}`}`
    }));

  const groups = groupBy(
    matchedRoutes ?? [],
    (route) => route.path.split("/")[0]
  );

  return () => {
    return (
      <Box sx={{ py: 16, px: 0 }}>
        {map(groups, (routes, group) => {
          const [index, subRoutes] = partition(
            routes,
            (r) => r.fullPath === `${base}/${group}`
          );

          const finalSubRoutes = subRoutes.filter(
            (r) => !routeMeta(r, "hidden", false)
          );

          const iconEl = renderMeta(
            index[0] ?? routes[0],
            "icon",
            (icon) => icon ? <Icon path={icon} placement="start" /> : null,
            () => <div data-icon="" data-placement="start" />
          );

          const menuEl = renderMeta(index[0] ?? routes[0], "menu", (Menu) =>
            Menu ? (
              <Menu />
            ) : finalSubRoutes.length > 0 ? (
              <>
                {map(finalSubRoutes, (subRoute) => (
                  <TextButton
                    key={subRoute.name}
                    component={RouterLink}
                    activeClass={"active"}
                    to={subRoute.fullPath}
                    sx={{
                      width: "100%",
                      justifyContent: "flex-start"
                    }}
                  >
                    {routeMeta(subRoute, "name", subRoute.name)}
                  </TextButton>
                ))}
              </>
            ) : null
          );

          return (
            <Box key={group} sx={{ px: 8 }}>
              {index[0] ? (
                <TextButton
                  component={RouterLink}
                  sx={{
                    width: "100%",
                    justifyContent: "flex-start",
                    $data_icon: {
                      boxSize: 24,
                      mr: 8
                    }
                  }}
                  activeClass={"active"}
                  to={index[0]?.fullPath}
                >
                  {iconEl}
                  {routeMeta(index[0], "name", group)}
                </TextButton>
              ) : (
                <TextButton
                  sx={{
                    width: "100%",
                    justifyContent: "flex-start",
                    $data_icon: {
                      boxSize: 24,
                      mr: 8
                    }
                  }}
                >
                  {iconEl}
                  {routeMeta(routes[0], "name", group)}
                </TextButton>
              )}
              {menuEl && <Box sx={{ pl: 16, py: 4 }}>{menuEl}</Box>}
            </Box>
          );
        })}
      </Box>
    );
  };
});
