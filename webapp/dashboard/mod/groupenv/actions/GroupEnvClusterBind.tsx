import {
  bindGroupEnvCluster,
  type Cluster
} from "@webapp/dashboard/client/dashboard";
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
  useDialogModal,
  Tooltip,
  IconButton,
  Icon,
  mdiLink
} from "@nodepkg/ui";
import { ClusterMenuList } from "@webapp/dashboard/mod/cluster";

export const useGroupEnvClusterBind = (
  resolve: () => {
    groupName: string;
    envName: string;
  }
) => {
  const bind$ = useRequest(bindGroupEnvCluster);

  const dialog$ = useDialogModal({
    $title: () => "绑定集群",
    $content: () => (
      <ClusterMenuList
        onSelected={(clusterID) => {
          bind$.next({
            ...resolve(),
            clusterID: clusterID
          });
        }}
      />
    )
  });

  return ext(bind$, {
    action: "绑定集群",
    dialog$: dialog$
  });
};

export const GroupEnvClusterBindBtn = component$(
  {
    groupName: t.string(),
    envName: t.string(),
    onDidBind: t.custom<(cluster?: Cluster, namespace?: string) => void>()
  },
  (props, { emit }) => {
    const bind$ = useGroupEnvClusterBind(() => ({
      groupName: props.groupName,
      envName: props.envName
    }));

    rx(
      bind$,
      subscribeUntilUnmount((resp) => emit("did-bind", resp.body?.cluster, resp.body?.namespace))
    );

    return () => {
      return (
        <AccessControl op={bind$}>
          <Tooltip title={bind$.action}>
            <IconButton onClick={() => (bind$.dialog$.value = true)}>
              <Icon path={mdiLink} />
            </IconButton>
          </Tooltip>
          {bind$.dialog$.elem}
        </AccessControl>
      );
    };
  }
);
