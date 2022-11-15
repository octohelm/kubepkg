import {
  ClusterEnvType,
  ClusterInfo,
  ClusterNetType,
  putCluster,
} from "../client/dashboard";
import { tap, map as rxMap, ignoreElements } from "rxjs";
import { useForm, fromErrorFields, useProxy, useDialogForm } from "../layout";
import { useRequest } from "@innoai-tech/reactutil";
import {
  when,
  string,
  required,
  match,
  eq,
  get,
  pipe,
  objectOf,
  oneOfEnum,
} from "@innoai-tech/form";

const useClusterForm = (initials?: Partial<ClusterInfo & { name: string }>) => {
  const putCluster$ = useRequest(putCluster);

  const form$ = useForm(initials || {}, () =>
    objectOf<ClusterInfo & { name: string }>({
      name: string()
        .label("集群名称")
        .need(required(), match(/[a-z][a-z0-9-]+/))
        .readOnly(!!initials),
      desc: string().label("集群描述"),
      envType: string<keyof typeof ClusterEnvType>()
        .label("集群类型")
        .need(required(), oneOfEnum(ClusterEnvType)),
      netType: string<keyof typeof ClusterNetType>()
        .label("集群网络类型")
        .need(required(), oneOfEnum(ClusterNetType)),
      endpoint: string()
        .label("集群访问地址")
        .need(
          when(pipe(get("netType"), eq(ClusterNetType.DIRECT)), required())
        ),
    })
  );

  return useProxy(
    form$,
    {
      post$: putCluster$,
      operationID: putCluster$.operationID,
    },
    (form$) =>
      form$.pipe(
        tap(({ name, ...others }) =>
          form$.post$.next({
            name,
            body: others,
          })
        )
      ),
    (form$) =>
      form$.post$.error$.pipe(
        rxMap((errors) => fromErrorFields(errors.body.errorFields)),
        tap(form$.setErrors),
        ignoreElements()
      )
  );
};

export const useClusterFormWithDialog = (
  initials?: Partial<ClusterInfo & { name: string }>
) => {
  const form$ = useClusterForm(initials);
  const action = initials ? "配置" : "创建";
  const title = `${action}集群`;

  const dialog$ = useDialogForm(form$, { action, title });

  return useProxy(
    form$,
    {
      dialog$: dialog$,
    },
    (form$) =>
      form$.post$.pipe(
        tap(() => form$.dialog$.next(false)),
        ignoreElements()
      )
  );
};
