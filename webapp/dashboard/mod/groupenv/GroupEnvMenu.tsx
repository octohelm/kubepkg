import { rx, component$, render, RouterLink } from "@nodepkg/runtime";
import { TextButton, Box } from "@nodepkg/ui";
import { GroupEnvProvider } from "@webapp/dashboard/mod/groupenv/GroupEnvContext";
import { map } from "@nodepkg/runtime/lodash";

export const GroupEnvMenu = component$(({}, {}) => {
  const groupEnv$ = GroupEnvProvider.use();

  return rx(
    groupEnv$,
    render((ge) => {
      return (
        <Box sx={{
          maxHeight: "60vh",
          overflow: "scroll"
        }}>
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4
          }}>
            {map(ge.envs, (env) => {
              return (
                <TextButton
                  key={env.envID}
                  component={RouterLink}
                  activeClass={"active"}
                  to={`/groups/${ge.groupName}/envs/${env.envName}`}
                  sx={{
                    width: "100%",
                    height: "auto",
                    justifyContent: "flex-start"
                  }}
                >
                  <Box sx={{
                    width: "100%",
                    overflow: "hidden",
                    wordBreak: "keep-all",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}>
                    <div>
                      {env.envName}
                    </div>
                    <Box sx={{
                      fontSize: "0.6em",
                      opacity: 0.7,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      wordBreak: "keep-all",
                      textOverflow: "ellipsis"
                    }}>
                      {env.desc}
                    </Box>
                  </Box>
                </TextButton>
              );
            })}
          </Box>
        </Box>
      );
    })
  );
});
