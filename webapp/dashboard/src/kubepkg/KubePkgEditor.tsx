import { isEmpty, mapValues, omit, pick, pickBy, startsWith } from "@innoai-tech/lodash";
import type { ApisKubepkgV1Alpha1KubePkg } from "../client/dashboard";
import {
  StateSubject,
  useObservableState,
  useAsObservable,
  useObservableEffect,
  usePlatform
} from "@nodepkg/state";
import {
  diagnosticCount,
  EditorContainer,
  EditorContextProvider,
  EditorView,
  forceLinting,
  keymap,
  useExtension,
  useJSONEditor,
  useJSONEditorReadOnly
} from "@nodepkg/codemirror";
import { get } from "@innoai-tech/lodash";
import { useMemo } from "react";
import { Box, Divider, Stack } from "@mui/material";
import { firstValueFrom, tap } from "rxjs";
import { RawOpenAPI } from "../client/dashboard";
import { SchemaVisitor } from "./utils";
import { IconButtonWithTooltip } from "../layout";
import { Publish } from "@mui/icons-material";

const annotationKubepkgOverwrites = "kubepkg.innoai.tech/overwrites";

export const KubePkgEditor = ({
                                kubepkg$,
                                onSubmit
                              }: {
  kubepkg$: StateSubject<ApisKubepkgV1Alpha1KubePkg>;
  onSubmit?: (kubepkg: ApisKubepkgV1Alpha1KubePkg) => void
}) => {
  const kubepkg = useObservableState(kubepkg$);

  const [overwritesMode, jsonCode, overwritesCode] = useMemo(() => {
    const filtered = pick(kubepkg, ["apiVersion", "kind", "metadata", "spec"]);

    return [
      !isEmpty(filtered),
      JSON.stringify(
        {
          ...filtered,
          metadata: {
            ...kubepkg.metadata,
            annotations: pickBy(
              kubepkg.metadata?.annotations || {},
              (_, k) =>
                startsWith(k, "kubepkg.innoai.tech/") &&
                k != annotationKubepkgOverwrites
            )
          }
        },
        null,
        2
      ),
      JSON.stringify(
        JSON.parse(
          get(
            kubepkg,
            ["metadata", "annotations", annotationKubepkgOverwrites],
            `{"spec":{}}`
          )
        ),
        null,
        2
      )
    ];
  }, [kubepkg]);

  const overwritesSchema = useMemo(() => {
    const s = SchemaVisitor.create(
      {
        ...RawOpenAPI.components.schemas["ApisKubepkgV1Alpha1KubePkg"]
      },
      (ref) => get(RawOpenAPI, ref.split("/").slice(1), {}),
      (schema) => {
        if (schema.type == "object") {
          return omit(schema, ["required"]);
        }
        return schema;
      },
      (schema) => {
        if (schema.type === "object") {
          switch (get(schema, "x-go-field-name")) {
            case "ObjectMeta": {
              return {
                type: "object",
                properties: pick(schema.properties, ["name"])
              };
            }
            case "Spec": {
              if (overwritesMode) {
                const configProps = mapValues(kubepkg.spec.config ?? {}, (_) => ({ "type": "string" }));

                return {
                  type: "object",
                  properties: {
                    ...omit(schema.properties, ["version"]),
                    config: {
                      type: "object",
                      properties: configProps
                    }
                  }
                };
              }
            }
          }
        }
        return schema;
      }
    );

    const schema = s.simplify();

    return {
      type: "object",
      properties: pick(schema.properties, ["metadata", "spec"]),
      additionalProperties: false
    };
  }, [kubepkg, overwritesMode]);

  return (
    <Stack direction={"column"} spacing={2} sx={{ height: "100%", overflow: "hidden" }}>
      <Box sx={{ flex: 1, overflow: "auto", position: "relative" }}>
        <EditorContextProvider>
          <TemplateOverwrites
            code={overwritesCode}
            schema={overwritesSchema}
            kubepkg$={kubepkg$}
            onSubmit={onSubmit}
          />
        </EditorContextProvider>
      </Box>
      {overwritesMode && (
        <>
          <Divider />
          <Box sx={{ height: "32vh" }}>
            <EditorContextProvider>
              <TemplatePreview code={jsonCode} />
            </EditorContextProvider>
          </Box>
        </>
      )}
    </Stack>
  );
};

const TemplatePreview = ({ code }: { code: string }) => {
  useJSONEditorReadOnly();

  const editorContext = EditorContextProvider.use();
  const code$ = useAsObservable(code);
  useObservableEffect(() => code$.pipe(tap((v) => editorContext.doc$.next(v))));

  return <EditorContainer />;
};

const TemplateOverwrites = ({
                              code,
                              schema,
                              kubepkg$,
                              onSubmit
                            }: {
  code: string;
  schema: any;
  kubepkg$: StateSubject<ApisKubepkgV1Alpha1KubePkg>;
  onSubmit?: (kubepkg: ApisKubepkgV1Alpha1KubePkg) => void
}) => {
  useJSONEditor(schema);

  const p = usePlatform();

  const { execute } = useMemo(
    () => ({
      execute: (view: EditorView): boolean => {
        forceLinting(view);

        setTimeout(() => {
          if (diagnosticCount(view.state) === 0) {
            onSubmit && onSubmit(((kubepkg) => {
              if (get(kubepkg, ["metadata", "annotations", annotationKubepkgOverwrites])) {
                return {
                  ...kubepkg,
                  metadata: {
                    ...kubepkg.metadata,
                    annotations: {
                      ...(kubepkg.metadata?.annotations ?? {}),
                      [annotationKubepkgOverwrites]: JSON.stringify(
                        JSON.parse(view.state.doc.sliceString(0))
                      )
                    }
                  }
                };
              }

              return {
                apiVersion: "octohelm.tech/v1alpha1",
                kind: "KubePkg",
                ...JSON.parse(view.state.doc.sliceString(0))
              };
            })(kubepkg$.value));
          }
        });

        return true;
      }
    }),
    []
  );

  useExtension(() => [
    keymap.of([
      {
        key: `${p.os.mac ? "Cmd" : "Ctrl"}-Enter`,
        run: execute
      }
    ])
  ]);

  const editorContext = EditorContextProvider.use();
  const json$ = useAsObservable(code);
  useObservableEffect(() => json$.pipe(tap((v) => editorContext.doc$.next(v))));
  return (
    <>
      <EditorContainer />
      {onSubmit && (
        <Box sx={{ position: "absolute", bottom: 0, right: 0 }}>
          <IconButtonWithTooltip
            title={`提交 ${p.os.mac ? "Cmd" : "Ctrl"}+Enter`}
            onClick={async () => {
              const view = await firstValueFrom(editorContext.view$);
              view && execute(view);
            }}
          >
            <Publish />
          </IconButtonWithTooltip>
        </Box>
      )}
    </>
  );
};
