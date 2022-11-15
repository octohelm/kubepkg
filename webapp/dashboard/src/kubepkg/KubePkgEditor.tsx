import { map, pick } from "@innoai-tech/lodash";
import type { ApisKubepkgV1Alpha1KubePkg } from "../client/dashboard";
import { StateSubject, useObservable } from "@innoai-tech/reactutil";

import { Editor } from "../layout";
import { RawOpenAPI } from "../client/dashboard";
import { useMemo } from "react";


export const KubePkgEditor = ({ kubepkg$ }: { kubepkg$: StateSubject<ApisKubepkgV1Alpha1KubePkg> }) => {
  const kubepkg = useObservable(kubepkg$);

  const jsonCode = useMemo(() => JSON.stringify(pick(kubepkg, ["apiVersion", "kind", "metadata", "spec"]), null, 2), [kubepkg]);

  return (
    <Editor
      height="70vh"
      theme="vs-dark"
      language="json"
      path="x.kube.json"
      value={jsonCode}
      onChange={(value) => {
        if (value) {
          try {
            kubepkg$.next(JSON.parse(value));
          } catch (e) {
          }
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
            fileMatch: k == "ApisKubepkgV1Alpha1KubePkg" ? ["*"] : []
          };
        });

        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          schemas: schemas
        });
      }}
    />
  );
};
