import {
  useRequest,
  component$,
  rx,
  t,
  ext,
  FormData,
  subscribeUntilUnmount
} from "@nodepkg/runtime";
import {
  type Cluster,
  ClusterEnvType,
  type ClusterInfo,
  ClusterNetType,
  putCluster
} from "@webapp/dashboard/client/dashboard";
import {
  useDialogForm,
  Tooltip,
  IconButton,
  Icon,
  mdiPlusThick,
  mdiSquareEditOutline
} from "@nodepkg/ui";
import { AccessControl } from "@webapp/dashboard/mod/auth";

export const REGEX_ID = [
  /[a-z][a-z0-9-]+/,
  "只能包含小写字符，数字与短横 -， 且必须由小写字符开头"
] as const;

const schema = t.intersection(
  t.object({
    name: t
      .string()
      .use(
        t.pattern(...REGEX_ID),
        FormData.label("集群名称").readOnlyWhenInitialExist()
      ),
    desc: t.string().optional().use(FormData.label("集群描述")),
    envType: t.nativeEnum(ClusterEnvType).use(FormData.label("集群类型"))
  }),
  t
    .discriminatorMapping("netType", {
      [ClusterNetType.AIRGAP]: t.object({}),
      [ClusterNetType.DIRECT]: t.object({
        endpoint: t.string().use(FormData.label("集群访问地址"))
      })
    })
    .use(FormData.label("集群网络类型"))
);

export const useClusterPut = (initials?: ClusterInfo & { name: string }) => {
  const put$ = useRequest(putCluster);
  const form$ = FormData.of(schema, initials ?? {});

  rx(
    form$,
    subscribeUntilUnmount(({ name, ...body }) => {
      put$.next({
        name: name,
        body: body
      });
    })
  );

  rx(
    put$.error$,
    subscribeUntilUnmount((resp) => {
      form$.setErrors(FormData.errorFromRespError(resp.error));
    })
  );

  const action = initials ? "编辑集群" : "新建集群";

  const dialog$ = useDialogForm(form$, { action });

  rx(
    put$,
    subscribeUntilUnmount(() => {
      dialog$.value = false;
    })
  );

  return ext(put$, {
    action,
    form$,
    dialog$
  });
};

export const ClusterAddBtn = component$(
  {
    onDidAdd: t.custom<(c: Cluster) => void>()
  },
  ({}, { emit }) => {
    const put$ = useClusterPut();

    rx(
      put$,
      subscribeUntilUnmount((resp) => emit("did-add", resp.body))
    );

    return () => {
      return (
        <AccessControl op={put$}>
          <Tooltip title={put$.action}>
            <IconButton onClick={() => (put$.dialog$.value = true)}>
              <Icon path={mdiPlusThick} />
            </IconButton>
          </Tooltip>
          {put$.dialog$.elem}
        </AccessControl>
      );
    };
  }
);

export const ClusterEditBtn = component$(
  {
    cluster: t.custom<Cluster>(),
    onDidUpdate: t.custom<(c: Cluster) => void>()
  },
  (props, { emit }) => {
    const put$ = useClusterPut(props.cluster);

    rx(
      put$,
      subscribeUntilUnmount((resp) => emit("did-update", resp.body))
    );

    return () => {
      return (
        <AccessControl op={put$}>
          <Tooltip title={put$.action}>
            <IconButton onClick={() => (put$.dialog$.value = true)}>
              <Icon path={mdiSquareEditOutline} />
            </IconButton>
          </Tooltip>
          {put$.dialog$.elem}
        </AccessControl>
      );
    };
  }
);
