import { t, render, component$, rx, RouterLink } from "@nodepkg/runtime";
import { Box, Divider, ListItem, styled } from "@nodepkg/ui";
import { type GroupEnvWithCluster } from "@webapp/dashboard/client/dashboard";
import { Container } from "@webapp/dashboard/layout";
import { GroupEnvProvider } from "@webapp/dashboard/mod/groupenv";
import { map } from "@nodepkg/runtime/lodash";
import { GroupEnvAddBtn, GroupEnvDeleteBtn, GroupEnvEditBtn } from "./actions";

export const GroupEnvListItem = component$(
  {
    groupName: t.string(),
    env: t.custom<GroupEnvWithCluster>(),
  },
  (props, { render }) => {
    const groupEnv$ = GroupEnvProvider.use();

    return rx(
      props.env$,
      render((env) => {
        return (
          <ListItem
            $heading={
              <Box sx={{ display: "flex", alignItems: "center", gap: 8 }}>
                <RouterLink
                  to={`/groups/${props.groupName}/envs/${env.envName}`}
                >
                  {env.envName}
                </RouterLink>
                <Divider orientation="vertical" />
                <Chip>{env.envType}</Chip>
                <Divider orientation="vertical" />
                <span>{env.desc}</span>
              </Box>
            }
            $trailing={
              <>
                <GroupEnvEditBtn
                  groupName={props.groupName}
                  groupEnv={env}
                  onDidUpdate={(e) => {
                    groupEnv$.put(e.envName, e);
                  }}
                />
                <GroupEnvDeleteBtn
                  groupName={props.groupName}
                  envName={env.envName}
                  onDidDelete={(envName) => {
                    groupEnv$.del(envName);
                  }}
                />
              </>
            }
          />
        );
      })
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
  alignItems: "center",
});

export const GroupEnvList = component$(({}, {}) => {
  const groupEnv$ = GroupEnvProvider.use();

  const listEl = rx(
    groupEnv$,
    render((ge) => {
      return (
        <>
          {map(ge.envs, (env) => {
            return (
              <GroupEnvListItem
                key={env.envID}
                groupName={ge.groupName}
                env={env}
              />
            );
          })}
        </>
      );
    })
  );

  return () => (
    <Container
      $action={
        <GroupEnvAddBtn
          groupName={groupEnv$.value.groupName}
          onDidAdd={(e) => {
            groupEnv$.put(e.envName, e);
          }}
        />
      }
    >
      {listEl}
    </Container>
  );
});
