import {
  t,
  render,
  component,
  component$,
  rx,
  RouterLink,
  useRequest,
  observableRef,
  subscribeOnMountedUntilUnmount
} from "@nodepkg/runtime";
import { Box, ListItem, styled } from "@nodepkg/ui";
import { type Kubepkg, listKubepkg } from "@webapp/dashboard/client/dashboard";
import { Container } from "@webapp/dashboard/layout";

import { map, groupBy } from "@nodepkg/runtime/lodash";
import { GroupProvider } from "@webapp/dashboard/mod/group";

export const GroupKubepkgListGroup = component(
  {
    groupName: t.string(),
    base: t.string(),
    kubepkgs: t.custom<Kubepkg[]>()
  },
  (props, {}) => {
    return () => (
      <ListItem
        $heading={<Chip>{props.base}</Chip>}
        $supporting={
          <Box
            sx={{
              pl: 24,
              pt: 8,
              display: "flex",
              flexDirection: "column",
              gap: 4
            }}
          >
            {map(props.kubepkgs, (k) => (
              <Box
                component={RouterLink}
                to={`/groups/${props.groupName}/kubepkgs/${k.name}`}
                sx={{
                  width: "100%"
                }}
              >
                {k.name}
              </Box>
            ))}
          </Box>
        }
      />
    );
  }
);

const Chip = styled("span")({
  px: 10,
  h: 18,
  rounded: 18,
  textStyle: "sys.body-small",
  containerStyle: "sys.primary-container",
  display: "inline-flex",
  alignItems: "center"
});

export const GroupKubepkgList = component$(({}, {}) => {
  const group$ = GroupProvider.use();

  const list$ = useRequest(listKubepkg);

  const filters$ = observableRef({
    name: ""
  });

  rx(
    filters$,
    subscribeOnMountedUntilUnmount((filters) => {
      list$.next({
        groupName: group$.value.name,
        name: filters.name ? [filters.name] : undefined,
        size: -1
      });
    })
  );

  const listEl = rx(
    list$,
    render((resp) => {
      const grouped = groupBy(resp.body, (k) => k.name.split("--")[0]);

      return (
        <>
          {map(grouped, (list, base) => {
            return (
              <GroupKubepkgListGroup
                key={base}
                groupName={group$.value.name}
                base={base}
                kubepkgs={list}
              />
            );
          })}
        </>
      );
    })
  );

  return () => (
    <Container>
      {listEl}
    </Container>
  );
});
