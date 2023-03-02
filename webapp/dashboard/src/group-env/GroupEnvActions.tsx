import { ClusterEnvType, deleteGroupEnv, GroupEnvInfo, putGroupEnv } from "../client/dashboard";
import { tap, map as rxMap, merge } from "rxjs";
import { useForm, useProxy, useDialogForm, fromErrorFields, useDialog } from "../layout";
import { useRequest, useObservableEffect } from "@nodepkg/state";
import {
  string,
  required,
  match,
  objectOf,
  oneOfEnum
} from "@innoai-tech/form";
import { GroupProvider } from "../group";
import { Box } from "@mui/material";

export const useGroupEnvPut = (
  initials?: Partial<GroupEnvInfo & { envName: string }>
) => {
  const group$ = GroupProvider.use$();
  const put$ = useRequest(putGroupEnv);

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

  useObservableEffect(() =>
    merge(
      put$.error$.pipe(
        rxMap((errors) => fromErrorFields(errors.body?.errorFields)),
        tap(form$.setErrors)
      ),
      form$.pipe(
        tap(({ envName, ...others }) => {
          put$.next({
            groupName: group$.value.name,
            envName,
            body: others
          });
        })
      )
    )
  );

  return useProxy(put$, {
    form$: form$
  });
};

export const useGroupEnvPutDialog = (
  initials?: Partial<GroupEnvInfo & { name: string }>
) => {
  const put$ = useGroupEnvPut(initials);

  const action = initials ? "配置" : "创建";
  const title = `${action}环境`;

  const dialog$ = useDialogForm(put$.form$, { action, title });

  useObservableEffect(() => put$.pipe(tap(() => dialog$.next(false))));

  return useProxy(put$, {
    dialog$: dialog$
  });
};

export const useGroupEnvDelDialog = ({ groupName, envName }: { groupName: string, envName: string }) => {
  const del$ = useRequest(deleteGroupEnv);

  const dialog$ = useDialog({
    title: "确认删除环境",
    content: (
      <Box>
        {envName}
      </Box>
    ),
    onConfirm: () => {
      del$.next({ groupName, envName });
    }
  });

  useObservableEffect(() => del$.pipe(tap(() => dialog$.next(false))));

  return useProxy(del$, {
    dialog$: dialog$
  });
};