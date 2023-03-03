import { renameCluster } from "../client/dashboard";
import { tap, map as rxMap, ignoreElements } from "rxjs";
import { useForm, fromErrorFields, useProxy, useDialogForm } from "../layout";
import { useRequest } from "@nodepkg/runtime";
import { string, required, match, objectOf } from "@innoai-tech/form";
import { useRef } from "react";

export const useClusterFormRename = (oldName: string) => {
  const renameCluster$ = useRequest(renameCluster);

  const form$ = useForm({ newName: oldName }, () =>
    objectOf<{ newName: string }>({
      newName: string()
        .label("集群名称")
        .need(required(), match(/[a-z][a-z0-9-]+/)),
    })
  );

  const oldNameRef = useRef<string>(oldName);
  oldNameRef.current = oldName;

  return useProxy(
    form$,
    {
      operationID: renameCluster$.operationID,
      post$: renameCluster$,
    },
    (form$) =>
      form$.pipe(
        tap(({ newName }) =>
          form$.post$.next({
            name: oldNameRef.current,
            newName,
          })
        )
      ),
    (form$) =>
      form$.post$.error$.pipe(
        rxMap((errors) => fromErrorFields(errors.body.errorFields)),
        tap(form$.setErrors)
      )
  );
};

export const useClusterFormRenameWithDialog = (oldName: string) => {
  const form$ = useClusterFormRename(oldName);

  const action = "集群重命名";

  const dialog$ = useDialogForm(form$, { action, title: action });

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
