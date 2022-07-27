import { ClusterEnvType, GroupEnvInfo, putGroupEnv } from "../client/dashboard";
import { tap, map as rxMap, ignoreElements } from "rxjs/operators";
import { useForm, fromErrorFields, useProxy, useDialogForm } from "../layout";
import { useRequest } from "@innoai-tech/reactutil";
import {
  string,
  required,
  match,
  objectOf,
  oneOfEnum
} from "@innoai-tech/form";
import { GroupProvider } from "../group";

export const useGroupEnvForm = (
  initials?: Partial<GroupEnvInfo & { envName: string }>
) => {
  const group$ = GroupProvider.use$();
  const putGroupEnv$ = useRequest(putGroupEnv);

  const form$ = useForm(initials || {}, () =>
    objectOf<GroupEnvInfo & { envName: string }>({
      envName: string()
        .label("环境名称")
        .need(required(), match(/[a-z][a-z0-9-]+/))
        .readOnly(!!initials),
      desc: string().label("环境描述"),
      envType: string<keyof typeof ClusterEnvType>()
        .label("环境类型")
        .need(required(), oneOfEnum(ClusterEnvType))
    })
  );

  return useProxy(form$, {
      operationID: putGroupEnv$.operationID,
      post$: putGroupEnv$
    },
    (form$) =>
      form$.post$.error$.pipe(
        rxMap((errors) => fromErrorFields(errors.body?.errorFields)),
        tap(form$.setErrors),
        ignoreElements()
      ),
    (form$) =>
      form$.pipe(
        tap(({ envName, ...others }) => {
          form$.post$.next({
            groupName: group$.value.name,
            envName,
            body: others
          });
        }),
        ignoreElements()
      )
  );
};

export const useGroupEnvFormWithDialog = (
  initials?: Partial<GroupEnvInfo & { name: string }>
) => {
  const form$ = useGroupEnvForm(initials);

  const action = initials ? "配置" : "创建";
  const title = `${action}环境`;

  const dialog$ = useDialogForm(form$, { action, title });

  return useProxy(form$, {
      dialog$: dialog$
    }, (form$) =>
      form$.post$.pipe(
        tap(() => form$.dialog$.next(false)),
        ignoreElements()
      )
  );
};
