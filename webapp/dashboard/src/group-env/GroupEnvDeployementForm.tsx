import { ApisKubepkgV1Alpha1KubePkg, RawOpenAPI } from "../client/dashboard";
import { GroupEnvDeploymentsProvider } from "../group";
import { useMemo } from "react";
import { useStateSubject } from "@innoai-tech/reactutil";
import { useDialog, Editor, useProxy } from "../layout";
import { ignoreElements, tap } from "rxjs";
import { map } from "@innoai-tech/lodash";

export const useGroupEnvDeploymentFormWithDialog = (
  kubepkg?: ApisKubepkgV1Alpha1KubePkg
) => {
  const groupEnvDeployments$ = GroupEnvDeploymentsProvider.use$();
  const value$ = useStateSubject(kubepkg);

  const jsonCode = useMemo(() => JSON.stringify(kubepkg, null, 2), []);

  const action = kubepkg ? "编辑" : "创建";

  const dialog$ = useDialog({
    title: `${action} KubePkg`,
    action: `${action} KubePkg`,
    sx: { "& .MuiDialog-paper": { maxWidth: "80vw", width: "80vw" } },
    content: (
      <Editor
        height="70vh"
        theme={"vs-dark"}
        language={"json"}
        path={"x.kube.json"}
        defaultValue={jsonCode}
        onChange={(value) => {
          if (value) {
            try {
              value$.next(JSON.parse(value));
            } catch (e) {}
          }
        }}
        beforeMount={(monaco) => {
          const schemas = map(RawOpenAPI.components.schemas, (s, k) => {
            return {
              uri: `http://kubepkg.octohelm.tech/${k}`,
              schema: JSON.parse(
                JSON.stringify(s).replaceAll(
                  "#/components/schemas/",
                  "http://kubepkg.octohelm.tech/"
                )
              ),
              fileMatch: k == "ApisKubepkgV1Alpha1KubePkg" ? ["*"] : [],
            };
          });

          monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: schemas,
          });
        }}
      />
    ),
    onConfirm: () => {
      if (value$.value) {
        groupEnvDeployments$.put$.next({
          groupName: groupEnvDeployments$.groupName,
          envName: groupEnvDeployments$.envName,
          body: value$.value,
        });
      }
    },
  });

  return useProxy(
    groupEnvDeployments$,
    {
      operationID: groupEnvDeployments$.put$.operationID,
      dialog$: dialog$,
    },
    (groupEnvDeployments$) =>
      groupEnvDeployments$.pipe(
        tap(() => dialog$.next(false)),
        ignoreElements()
      )
  );
};
