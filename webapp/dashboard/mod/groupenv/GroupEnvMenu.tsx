import { rx, component$, render, RouterLink } from "@nodepkg/runtime";
import { TextButton } from "@nodepkg/ui";
import { GroupEnvProvider } from "@webapp/dashboard/mod/groupenv/GroupEnvContext";
import { map } from "@nodepkg/runtime/lodash";

export const GroupEnvMenu = component$(({}, {}) => {
  const groupEnv$ = GroupEnvProvider.use();

  return rx(
    groupEnv$,
    render((ge) => {
      return (
        <div>
          {map(ge.envs, (env) => {
            return (
              <TextButton
                key={env.envID}
                component={RouterLink}
                activeClass={"active"}
                to={`/groups/${ge.groupName}/envs/${env.envName}`}
                sx={{
                  width: "100%",
                  justifyContent: "flex-start"
                }}
              >
                {env.envName}
              </TextButton>
            );
          })}
        </div>
      );
    })
  );
});
