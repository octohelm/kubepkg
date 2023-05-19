import { component$, t } from "@nodepkg/runtime";
import {
  GroupEnvDeploymentCreate,
  GroupEnvProvider
} from "@webapp/dashboard/mod/groupenv";
import { rx, render } from "@innoai-tech/vuekit";
import { map } from "@nodepkg/runtime/rxjs";

export default component$(
  {
    group: t.string(),
    env: t.string()
  },
  (props) => {
    const ge$ = GroupEnvProvider.use();

    return rx(
      ge$,
      map((ge) => {
        return ge.envs[props.env];
      }),
      render((env) => {
        if (!env) {
          return null;
        }

        return <GroupEnvDeploymentCreate groupName={ge$.value.groupName} env={env} syncToURL />;
      })
    );
  }
);
