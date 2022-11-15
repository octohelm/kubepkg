import { tap, map as rxMap, ignoreElements } from "rxjs/operators";
import { useForm, fromErrorFields, useProxy, useDialogForm } from "../layout";
import { string, required, match, objectOf } from "@innoai-tech/form";
import { GroupRobotProvider } from "./domain";
import type { AccountRobotInfo } from "../client/dashboard";

export const useGroupRobotForm = (initials?: Partial<AccountRobotInfo>) => {
  const groupRobots$ = GroupRobotProvider.use$();

  const form$ = useForm(initials || {}, () =>
    objectOf<AccountRobotInfo & { name: string }>({
      name: string()
        .label("机器人名称")
        .need(required(), match(/[a-z][a-z0-9-]+/))
        .readOnly(!!initials),
    })
  );

  return useProxy(
    form$,
    {
      operationID: groupRobots$.create$.operationID,
      post$: groupRobots$.create$,
    },
    (form$) =>
      form$.post$.error$.pipe(
        rxMap((errors) => fromErrorFields(errors.body?.errorFields)),
        tap(form$.setErrors),
        ignoreElements()
      ),
    (form$) =>
      form$.pipe(
        tap((formData) => {
          form$.post$.next({
            groupName: groupRobots$.groupName,
            body: formData,
          });
        }),
        ignoreElements()
      )
  );
};

export const useGroupRobotFormWithDialog = (
  initials?: Partial<AccountRobotInfo>
) => {
  const form$ = useGroupRobotForm(initials);
  const action = `${initials ? "配置" : "创建"}`;
  const title = `${action}机器人`;

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
