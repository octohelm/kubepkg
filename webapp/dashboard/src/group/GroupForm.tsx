import { GroupInfo, putGroup } from "../client/dashboard";
import { tap, map as rxMap, ignoreElements } from "rxjs/operators";
import { useForm, fromErrorFields, useProxy, useDialogForm } from "../layout";
import { useRequest } from "@innoai-tech/reactutil";
import { string, required, match, objectOf } from "@innoai-tech/form";

export const useGroupForm = (
  initials?: Partial<GroupInfo & { name: string }>
) => {
  const putGroup$ = useRequest(putGroup);

  const form$ = useForm(initials || {}, () =>
    objectOf<GroupInfo & { name: string }>({
      name: string()
        .label("组织名称")
        .need(required(), match(/[a-z][a-z0-9-]+/))
        .readOnly(!!initials),
      desc: string().label("组织描述")
    })
  );

  return useProxy(form$, {
      operationID: putGroup$.operationID,
      post$: putGroup$
    },
    (form$) =>
      form$.post$.error$.pipe(
        rxMap((errors) => fromErrorFields(errors.body?.errorFields)),
        tap(form$.setErrors),
        ignoreElements()
      ),
    (form$) =>
      form$.pipe(
        tap(({ name, ...others }) => {
          form$.post$.next({
            groupName: name,
            body: others
          });
        }),
        ignoreElements()
      )
  );
};

export const useGroupFormWithDialog = (
  initials?: Partial<GroupInfo & { name: string }>
) => {
  const form$ = useGroupForm(initials);
  const action = initials ? "配置" : "创建";
  const title = `${action}组织`;

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
