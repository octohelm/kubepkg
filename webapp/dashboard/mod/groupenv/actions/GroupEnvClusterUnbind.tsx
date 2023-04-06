import { type Cluster, unbindGroupEnvCluster } from "@webapp/dashboard/client/dashboard";
import { AccessControl } from "@webapp/dashboard/mod/auth";
import {
  component$,
  useRequest,
  t,
  ext,
  rx,
  subscribeUntilUnmount
} from "@nodepkg/runtime";
import {
  useDialogPrompt,
  Tooltip,
  IconButton,
  Icon,
  mdiLinkOff
} from "@nodepkg/ui";

export const useGroupEnvClusterUnbind = (resolve: () => ({
  groupName: string;
  envName: string;
  cluster: Cluster;
})) => {
  const unbind$ = useRequest(unbindGroupEnvCluster);

  const dialog$ = useDialogPrompt({
    $title: () => "确认解绑集群",
    $content: () => resolve().cluster.name,
    onConfirm: () => {
      const c = resolve();

      unbind$.next({
        groupName: c.groupName,
        envName: c.envName,
        clusterID: c.cluster.clusterID
      });
    }
  });

  return ext(unbind$, {
    action: "解绑",
    dialog$: dialog$
  });
};

export const GroupEnvClusterUnbindBtn = component$(
  {
    groupName: t.string(),
    envName: t.string(),
    cluster: t.custom<Cluster>(),
    onDidUnbind: t.custom<() => void>()
  },
  (props, { emit }) => {
    const del$ = useGroupEnvClusterUnbind(() => ({
      groupName: props.groupName,
      envName: props.envName,
      cluster: props.cluster
    }));

    rx(
      del$,
      subscribeUntilUnmount(() => emit("did-unbind"))
    );

    return () => {
      return (
        <AccessControl op={del$}>
          <Tooltip title={del$.action}>
            <IconButton onClick={() => (del$.dialog$.value = true)}>
              <Icon path={mdiLinkOff} />
            </IconButton>
          </Tooltip>
          {del$.dialog$.elem}
        </AccessControl>
      );
    };
  }
);
