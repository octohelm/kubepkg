import {
  createProvider,
  component$,
  useRequest,
  t,
  rx,
  subscribeUntilUnmount,
  subscribeOnMountedUntilUnmount,
  ImmerBehaviorSubject,
  type VNodeChild
} from "@nodepkg/runtime";
import {
  type Cluster,
  type GroupEnvWithCluster,
  listGroupEnv
} from "@webapp/dashboard/client/dashboard";
import { map } from "@nodepkg/runtime/rxjs";

export interface GroupEnvData {
  groupName: string;
  envs: Record<string, GroupEnvWithCluster>;
}

export class GroupEnvSubject extends ImmerBehaviorSubject<GroupEnvData> {
  put(envName: string, e: GroupEnvWithCluster) {
    this.next((v) => {
      v.envs[envName] = e;
    });
  }

  del(envName: string) {
    this.next((v) => {
      delete v.envs[envName];
    });
  }

  bindCluster(envName: string, cluster: Cluster, namespace: string) {
    this.next((v) => {
      if (v.envs[envName]) {
        v.envs[envName]!.cluster = cluster;
        v.envs[envName]!.namespace = namespace;
      }
    });
  }

  unbindCluster(envName: string) {
    this.next((v) => {
      if (v.envs[envName]) {
        v.envs[envName]!.cluster = undefined;
      }
    });
  }
}

export const GroupEnvProvider = createProvider(
  () =>
    new GroupEnvSubject({
      groupName: "",
      envs: {}
    }),
  {
    name: "GroupEnv"
  }
);

export const GroupEnvContext = component$(
  {
    groupName: t.string(),
    envName: t.string()?.optional(),
    $default: t.custom<VNodeChild>().optional()
  },
  (props, { slots }) => {
    const groupEnv$ = new GroupEnvSubject({
      groupName: props.groupName,
      envs: {}
    });

    const list$ = useRequest(listGroupEnv);

    rx(
      list$,
      map(
        (resp) =>
          [
            resp.body.reduce(
              (r, env) => ({
                ...r,
                [env.envName]: env
              }),
              {} as Record<string, GroupEnvWithCluster>
            ),
            resp.config.inputs.groupName
          ] as const
      ),
      subscribeUntilUnmount(([envs, groupName]) => {
        groupEnv$.next({
          groupName,
          envs: envs
        });
      })
    );

    rx(
      props.groupName$,
      subscribeOnMountedUntilUnmount((groupName) => {
        list$.next({
          groupName: groupName
        });
      })
    );

    return () => (
      <GroupEnvProvider key={props.groupName} value={groupEnv$}>
        {slots.default?.()}
      </GroupEnvProvider>
    );
  }
);
