import { component$, t } from "@nodepkg/runtime";
import {
  GroupEnvDeploymentList,
  GroupEnvProvider
} from "@webapp/dashboard/mod/groupenv";
import { rx, render } from "@innoai-tech/vuekit";
import { map, combineLatest } from "@nodepkg/runtime/rxjs";

export default component$(
  {
    group: t.string(),
    env: t.string()
  },
  (props) => {
    const ge$ = GroupEnvProvider.use();

    return rx(
      combineLatest(ge$, props.env$),
      map(([ge, env]) => {
        return ge.envs[env];
      }),
      render((env) => {
        if (!env) {
          return null;
        }

        return (
          <GroupEnvDeploymentList
            key={`${props.group}/${props.env}`}
            groupName={props.group}
            env={env}
          />
        );
      })
    );
  }
);
