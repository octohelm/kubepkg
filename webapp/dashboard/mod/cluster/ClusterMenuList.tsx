import { Box, styled, variant, alpha } from "@nodepkg/ui";
import { component$, rx, render, useRequest, t, onMounted } from "@nodepkg/runtime";
import { listCluster } from "@webapp/dashboard/client/dashboard";
import { Chip } from "./ui";
import { orderBy } from "@nodepkg/runtime/lodash";

export const ClusterMenuList = component$(
  {
    onSelected: t.custom<(clusterID: string) => void>(),
  },

  ({}, { emit }) => {
    const listCluster$ = useRequest(listCluster);

    onMounted(() => {
      listCluster$.next(undefined);
    });

    return rx(
      listCluster$,
      render((resp) => {
        return (
          <div>
            {orderBy(resp.body ?? [], (c) => c.envType).map((cluster) => {
              return (
                <MenuItem
                  key={cluster.clusterID}
                  onClick={() => emit("selected", cluster.clusterID)}
                >
                  <Chip>{cluster.envType}</Chip>
                  <span>{cluster.name}</span>
                  <Box sx={{ flex: 1, textAlign: "right" }}>{cluster.desc}</Box>
                </MenuItem>
              );
            })}
          </div>
        );
      })
    );
  }
);

const MenuItem = styled("div", {
  active: t.boolean().optional(),
})({
  py: 16,
  px: 16,
  textStyle: "sys.label-large",

  display: "flex",
  alignItems: "center",
  gap: 8,

  containerStyle: "inherit",

  _hover: {
    cursor: "pointer",
    bgColor: variant("sys.on-surface", alpha(0.08)),
  },

  _focus: {
    bgColor: variant("sys.on-surface", alpha(0.08)),
  },

  _active: {
    bgColor: variant("sys.on-surface", alpha(0.08)),
  },
});
