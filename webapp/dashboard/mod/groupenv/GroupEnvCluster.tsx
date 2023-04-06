import { component$, rx, render } from "@innoai-tech/vuekit";
import { styled } from "@nodepkg/ui";
import { t } from "@innoai-tech/typedef";
import { GroupEnvProvider } from "./GroupEnvContext";
import { map } from "@nodepkg/runtime/rxjs";
import { GroupEnvClusterBindBtn, GroupEnvClusterUnbindBtn } from "@webapp/dashboard/mod/groupenv/actions";

export const GroupEnvCluster = component$(
  {
    envName: t.string()
  },
  (props) => {
    const ge$ = GroupEnvProvider.use();

    return rx(
      ge$,
      map((ge) => {
        return ge.envs[props.envName];
      }),
      render((env) => {
        if (!env) {
          return null;
        }

        if (env.cluster) {
          return (
            <InfoToolbar>
              <span>
                 {env.namespace}.{env.cluster.name}
              </span>
              <GroupEnvClusterUnbindBtn
                groupName={ge$.value.groupName}
                envName={env.envName}
                cluster={env.cluster}
                onDidUnbind={() => {
                  ge$.unbindCluster(env.envName);
                }}
              />
            </InfoToolbar>
          );
        }

        return (
          <InfoToolbar>
          <span>
            未绑定集群
          </span>
            <GroupEnvClusterBindBtn
              groupName={ge$.value.groupName}
              envName={env.envName}
              onDidBind={(cluster, namespace) => {
                if (cluster) {
                  ge$.bindCluster(env.envName, cluster, namespace || env.envName);
                }
              }}
            />
          </InfoToolbar>
        );
      })
    );
  }
);

const InfoToolbar = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: 2,

  "& button": {
    visibility: "hidden"
  },
  _hover: {
    "& button": {
      visibility: "visible"
    }
  }
});
