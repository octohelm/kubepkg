import { delGroup, GroupInfo, GroupType, putGroup } from "../client/dashboard";
import { tap, map as rxMap, merge } from "rxjs";
import { useForm, fromErrorFields, useProxy, useDialogForm, useDialog } from "../layout";
import { useObservableEffect, useRequest } from "@nodepkg/state";
import {
  string,
  required,
  match,
  objectOf,
  oneOfEnum
} from "@innoai-tech/form";
import { Box } from "@mui/material";

export const useGroupPut = (
  initials?: Partial<GroupInfo & { name: string }>
) => {
  const put$ = useRequest(putGroup);

  const form$ = useForm(initials || {}, () =>
    objectOf<GroupInfo & { name: string }>({
      name: string()
        .label("组织名称")
        .need(required(), match(/[a-z][a-z0-9-]+/))
        .readOnly(!!initials),
      type: string<keyof typeof GroupType>()
        .label("组织类型")
        .need(required(), oneOfEnum(GroupType)),
      desc: string().label("组织描述")
    })
  );

  useObservableEffect(() =>
    merge(
      put$.error$.pipe(
        rxMap((errors) => fromErrorFields(errors.body?.errorFields)),
        tap(form$.setErrors)
      ),
      form$.pipe(
        tap(({ name, ...others }) => {
          put$.next({
            groupName: name,
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

export const useGroupPutDialog = (
  initials?: Partial<GroupInfo & { name: string }>
) => {
  const put$ = useGroupPut(initials);

  const action = initials ? "配置" : "创建";
  const title = `${action}组织`;

  const dialog$ = useDialogForm(put$.form$, {
    action,
    title
  });

  useObservableEffect(() => put$.pipe(tap(() => dialog$.next(false))));

  return useProxy(put$, {
    dialog$: dialog$
  });
};


export const useGroupDelDialog = ({ groupName }: { groupName: string }) => {
  const del$ = useRequest(delGroup);

  const dialog$ = useDialog({
    title: "确认删除组织",
    content: (
      <Box>
        {groupName}
      </Box>
    ),
    onConfirm: () => {
      del$.next({ groupName });
    }
  });

  useObservableEffect(() => del$.pipe(tap(() => dialog$.next(false))));

  return useProxy(del$, {
    dialog$: dialog$
  });
};
