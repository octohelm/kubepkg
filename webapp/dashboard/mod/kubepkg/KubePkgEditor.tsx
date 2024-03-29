import {
  type ApisKubepkgV1Alpha1KubePkg,
  ApisKubepkgV1Alpha1SpecSchema,
  ApisMetaV1ObjectMetaSchema,
  KubepkgChannel
} from "@webapp/dashboard/client/dashboard";
import { JSONSchemaEncoder } from "@innoai-tech/typedef";
import {
  component$,
  t,
  rx,
  subscribeUntilUnmount,
  PlatformProvider,
  observableRef
} from "@nodepkg/runtime";
import {
  diagnosticCount,
  EditorContainer,
  EditorContextProvider,
  EditorView,
  forceLinting,
  keymap,
  useExtension,
  useJSONEditor,
  useJSONDiff,
  diff
} from "@nodepkg/codemirror";
import { Box, Tooltip, FilledButton } from "@nodepkg/ui";
import { firstValueFrom, combineLatest } from "@nodepkg/runtime/rxjs";
import {
  get,
  merge,
  set,
  isPlainObject,
  isArray,
  isNull
} from "@nodepkg/runtime/lodash";

export const annotationKubepkgName = "kubepkg.innoai.tech/name";
export const annotationKubepkgRevision = "kubepkg.innoai.tech/revision";
export const annotationKubepkgChannel = "kubepkg.innoai.tech/channel";
export const annotationKubepkgDeploymentSettingID =
  "kubepkg.innoai.tech/deploymentSettingID";
export const annotationKubepkgOverwrites = "kubepkg.innoai.tech/overwrites";

export const getAnnotation = (
  kubepkg: ApisKubepkgV1Alpha1KubePkg,
  key: string
): string | undefined => {
  return get(kubepkg, ["metadata", "annotations", key]);
};

export const parseOverwrites = (jsonRaw: string = "") => {
  try {
    const v = JSON.parse(jsonRaw);
    if (isNull(v.spec)) {
      return undefined;
    }
    return v;
  } catch (e) {
    //
  }
  return undefined;
};

export const mergeOverwritesIfExists = (
  kubepkg: ApisKubepkgV1Alpha1KubePkg
) => {
  const overwrites = getAnnotation(kubepkg, annotationKubepkgOverwrites);

  if (overwrites) {
    return merge({},
      kubepkg,
      {
        metadata: {
          annotations: {
            [annotationKubepkgOverwrites]: null
          }
        }
      },
      parseOverwrites(overwrites)
    );
  }

  return kubepkg;
};

export const resolveKubePkgVersionAndSetting = (
  kubepkg?: ApisKubepkgV1Alpha1KubePkg
) => {
  if (kubepkg) {
    const [groupName, kubepkgName] = (
      getAnnotation(kubepkg, annotationKubepkgName) ?? ""
    ).split("/");
    const kubepkgChannel =
      getAnnotation(kubepkg, annotationKubepkgChannel) ?? KubepkgChannel.DEV;
    const revisionID = getAnnotation(kubepkg, annotationKubepkgRevision) ?? "";
    const deploymentSettingID =
      getAnnotation(kubepkg, annotationKubepkgDeploymentSettingID) ?? "";

    return {
      groupName: groupName ?? "",
      kubepkgName: kubepkgName ?? "",
      kubepkgChannel: kubepkgChannel as KubepkgChannel,
      revisionID,
      deploymentSettingID
    };
  }

  return {
    groupName: "",
    kubepkgName: "",
    kubepkgChannel: KubepkgChannel.DEV,
    revisionID: "",
    deploymentSettingID: ""
  };
};

export const KubePkgEditor = component$(
  {
    kubepkg: t.custom<ApisKubepkgV1Alpha1KubePkg>(),
    overwrites: t.custom<Partial<ApisKubepkgV1Alpha1KubePkg>>().optional(),
    onSubmit: t.custom<(kubepkg: ApisKubepkgV1Alpha1KubePkg) => void>()
  },
  (props, { emit }) => {
    return () => (
      <Box
        sx={{
          height: "100%",
          overflow: "hidden",
          position: "relative"
        }}
      >
        <Box
          sx={{
            height: "100%",
            overflow: "auto"
          }}
        >
          <EditorContextProvider>
            <TemplateEditor
              kubepkg={props.kubepkg}
              overwrites={props.overwrites}
              onSubmit={(kubepkg) => {
                emit("submit", kubepkg);
              }}
            />
          </EditorContextProvider>
        </Box>
      </Box>
    );
  }
);

const schema = JSONSchemaEncoder.encode(
  t.object({
    apiVersion: t.literal("octohelm.tech/v1alpha1"),
    kind: t.literal("KubePkg"),
    metadata: ApisMetaV1ObjectMetaSchema,
    spec: ApisKubepkgV1Alpha1SpecSchema
  })
);

const cloneWithoutNull = (o: any): any => {
  if (isPlainObject(o)) {
    const values: Record<string, any> = {};
    for (const k in o) {
      const v = cloneWithoutNull(o[k]);
      if (Object.is(v, null)) {
        continue;
      }
      values[k] = v;
    }
    return values;
  } else if (isArray(o)) {
    return o.map((v) => cloneWithoutNull(v));
  }
  return o;
};

export const diffAsOverwrites = (
  kubepkg: ApisKubepkgV1Alpha1KubePkg,
  overwrites: Partial<ApisKubepkgV1Alpha1KubePkg>
) => {
  const changes = diff({ spec: overwrites.spec }, { spec: kubepkg.spec });

  const newOverwrites = {
    spec: {
      config: {
        ...kubepkg.spec.config
      }
    }
  };

  for (const [k, [t, v]] of changes) {
    if (t == "m" || t == "a") {
      set(newOverwrites, k.slice(1).split("/"), v);
    }
  }

  return cloneWithoutNull(newOverwrites);
};

const TemplateEditor = component$(
  {
    kubepkg: t.custom<ApisKubepkgV1Alpha1KubePkg>(),
    overwrites: t.custom<Partial<ApisKubepkgV1Alpha1KubePkg>>().optional(),
    onSubmit: t.custom<(kubepkg: ApisKubepkgV1Alpha1KubePkg) => void>()
  },
  (props, { emit }) => {
    const p = PlatformProvider.use();

    useJSONEditor(schema);

    const overwrites$ = observableRef(props.overwrites ?? {});

    useJSONDiff(() => cloneWithoutNull(props.kubepkg));

    const editorCtx = EditorContextProvider.use();

    rx(
      combineLatest([props.kubepkg$, overwrites$]),
      subscribeUntilUnmount(([kubepkg, overwrites]) => {
        editorCtx.doc$.next(
          JSON.stringify(
            cloneWithoutNull(merge({}, kubepkg, overwrites)),
            null,
            2
          )
        );
      })
    );

    const execute = (view: EditorView): boolean => {
      forceLinting(view);

      setTimeout(() => {
        // valid
        if (diagnosticCount(view.state) === 0) {
          emit(
            "submit",
            cloneWithoutNull(JSON.parse(view.state.doc.sliceString(0)))
          );
        }
      });

      return true;
    };

    useExtension(() => [
      keymap.of([
        {
          key: `${p.os.mac ? "Cmd" : "Ctrl"}-Enter`,
          run: execute
        }
      ])
    ]);

    return () => {
      return (
        <>
          <EditorContainer />
          <Box sx={{ position: "absolute", bottom: 16, right: 16 }}>
            <Tooltip title={`${p.os.mac ? "Cmd" : "Ctrl"}+Enter`}>
              <FilledButton
                onClick={async () => {
                  const view = await firstValueFrom(editorCtx.view$);
                  view && execute(view);
                }}
              >
                提交
              </FilledButton>
            </Tooltip>
          </Box>
        </>
      );
    };
  }
);
