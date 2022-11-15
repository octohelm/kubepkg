import type { ApisKubepkgV1Alpha1KubePkg } from "../client/dashboard";
import { GroupEnvDeploymentsProvider } from "../group";
import { useStateSubject } from "@innoai-tech/reactutil";
import { useDialog, useProxy } from "../layout";
import { ignoreElements, tap } from "rxjs";
import { KubePkgEditor } from "../kubepkg";

export const useGroupEnvDeploymentFormWithDialog = (
  kubepkg?: ApisKubepkgV1Alpha1KubePkg
) => {
  const kubepkg$ = useStateSubject(kubepkg as ApisKubepkgV1Alpha1KubePkg);

  const groupEnvDeployments$ = GroupEnvDeploymentsProvider.use$();

  const action = kubepkg ? "编辑" : "创建";

  const dialog$ = useDialog({
    title: `${action} KubePkg`,
    action: `${action} KubePkg`,
    sx: { "& .MuiDialog-paper": { maxWidth: "80vw", width: "80vw" } },
    content: (
      <KubePkgEditor
        kubepkg$={kubepkg$}
      />
    ),
    onConfirm: () => {
      if (kubepkg$.value) {
        groupEnvDeployments$.put$.next({
          groupName: groupEnvDeployments$.groupName,
          envName: groupEnvDeployments$.envName,
          body: kubepkg$.value
        });
      }
    }
  });

  return useProxy(
    groupEnvDeployments$,
    {
      operationID: groupEnvDeployments$.put$.operationID,
      dialog$: dialog$
    },
    (groupEnvDeployments$) =>
      groupEnvDeployments$.pipe(
        tap(() => dialog$.next(false)),
        ignoreElements()
      )
  );
};
