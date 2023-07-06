import {
  distinctUntilChanged,
  map as rxMap,
  merge,
  firstValueFrom,
} from "@nodepkg/runtime/rxjs";
import { type OpenAPI } from "./OpenAPITypes";
import {
  last,
  map,
  filter,
  get,
  isEqual,
  mapValues,
  reduce,
  toPairs,
  keys,
  startsWith,
} from "@nodepkg/runtime/lodash";
import {
  RequestSchemaProvider,
  RequestSchemaView,
  TypeLink,
} from "./RequestSchemaView";
import {
  EditorContextProvider,
  useJSONEditor,
  keymap,
  EditorView,
  forceLinting,
  diagnosticCount,
  selectionAt,
  EditorContainer,
  createEditorContext,
  useExtension,
} from "@nodepkg/codemirror";
import {
  type JSONSchema,
  LSP,
  SchemaObjectType,
  SchemaRefType,
  SchemaType,
  SchemaUnionType,
} from "@nodepkg/jsonschema";
import { SchemaVisitor } from "./SchemaVisitor";
import { compilePath, getHeadContentType, pickValuesIn } from "./http";
import type { FetcherResponse, RequestConfig } from "@nodepkg/runtime/fetcher";
import { HttpRequest, HTTPResponse } from "./HTTPViews";
import { PlatformProvider } from "@nodepkg/runtime";
import {
  Box,
  Divider,
  IconButton,
  Icon,
  Tooltip,
  mdiPlayCircle,
} from "@nodepkg/ui";
import {
  useRequest,
  component,
  component$,
  t,
  observableRef,
  rx,
  render,
  subscribeUntilUnmount,
  type ObservableRef,
} from "@nodepkg/runtime";
import { Markdown } from "@nodepkg/vuemarkdown";

export const convertToRequestSchema = (openapi: any) => {
  const schema = {
    oneOf: map(openapi.operations, (operation, k) => ({
      properties: {
        [k]: {
          $ref: `#/definitions/${k}`,
          description: operation.summary,
        },
      },
      required: [k],
      additionalProperties: false,
      type: "object",
    })),
    definitions: {
      ...mapValues(openapi.operations, (operation) => {
        const parameters = [
          ...(operation.parameters || []),
          ...(operation.requestBody
            ? [
                {
                  in: "body",
                  name: "body",
                  required: operation.requestBody.required,
                  schema: (([ct, mt]: any[]) => ({
                    ...mt?.schema,
                    "x-content-type": ct,
                  }))(toPairs(operation.requestBody.content)[0] || []),
                },
              ]
            : []),
        ];

        const pickNamesBy = (by: (p: any) => boolean) =>
          map(filter(parameters, by), (p) => p.name);

        return {
          type: "object",
          description: [operation.summary, operation.description]
            .filter((v) => v)
            .join("\n\n"),
          "x-method": operation.method.toUpperCase(),
          "x-path": operation.path,
          "x-id": operation.operationId,
          required: pickNamesBy((p) => p.required),
          additionalProperties: false,
          properties: {
            ...reduce(
              parameters,
              (props, p) => ({
                ...props,
                [p.name]: {
                  ...p.schema,
                  "x-param-in": p.in,
                },
              }),
              {},
            ),
            __responses: {
              type: "object",
              description: "请求返回",
              properties: mapValues(operation.responses, ({ content }) => {
                const contentTypes = keys(content || {});

                if (contentTypes.length) {
                  return {
                    ...content[contentTypes[0]!].schema,
                    "x-content-type": contentTypes[0],
                  };
                }

                return {};
              }),
            },
          },
        };
      }),
    },
  };

  return SchemaVisitor.create(schema, (ref, v) => {
    const parts = ref.slice(2).split("/");
    const id = last(parts)!;

    if (startsWith(ref, "#/definitions/")) {
      schema.definitions[id] = v.process(schema.definitions[id]);

      return {
        $ref: ref,
      };
    }

    schema.definitions[id] = v.process(get(openapi, parts, {}));

    return {
      $ref: `#/definitions/${last(parts)!}`,
    };
  }).simplify();
};

export const RequestPlayground = component(
  {
    openapi: t.custom<OpenAPI>(),
  },
  (props) => {
    const schema = convertToRequestSchema(props.openapi);

    const ctx = createEditorContext(JSON.stringify({}, null, 2));

    return () => (
      <EditorContextProvider value={ctx}>
        <Playground schema={schema} openapi={props.openapi} />
      </EditorContextProvider>
    );
  },
);

const Playground = component(
  {
    schema: t.object(),
    openapi: t.custom<OpenAPI>(),
  },
  (props) => {
    useJSONEditor(props.schema);

    const schemaBreadcrumbs$ = observableRef<SchemaType[]>([]);

    const request$ = useRequest(((o: any) => {
      const operationID = keys(o)[0]!;
      const inputs = o[operationID];

      const operation = get(props.openapi, ["operations", operationID]);

      const c: RequestConfig<any> = {
        inputs: inputs,
        method: operation.method,
        url: `${operation.basePath || ""}${compilePath(
          operation.path,
          pickValuesIn("path", operation.parameters, inputs),
        )}`,
        params: pickValuesIn("query", operation.parameters, inputs),
        headers: pickValuesIn("header", operation.parameters, inputs),
        body: inputs.body,
      };

      const contentType = getHeadContentType(operation) || "application/json";

      if (c.body) {
        c.headers = {
          ...c.headers,
          "Content-Type": contentType + "; charset=UTF-8",
        };
      }

      return c;
    }) as any);

    const resp$ = observableRef({} as FetcherResponse<any, any>);

    rx(
      merge(request$, request$.error$),
      subscribeUntilUnmount((resp) => resp$.next(resp)),
    );

    const respEl = rx(
      resp$,
      render((response) =>
        response.config ? (
          <>
            <HttpRequest request={response.config} />
            <Divider />
            <HTTPResponse response={response} />
          </>
        ) : (
          <Tips />
        ),
      ),
    );

    return () => {
      return (
        <Box
          sx={{
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            px: 8,
            py: 16,
            position: "relative",
            display: "flex",
            flexDirection: "row",
            justifyContent: "stretch",
            backgroundColor: "sys.surface-container-lowest",
          }}
        >
          <Documents
            schema={props.schema}
            schemaBreadcrumbs$={schemaBreadcrumbs$}
          />
          <Box
            sx={{
              overflow: "hidden",
              flex: 1,
              px: 8,
              py: 16,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "stretch",
                width: "100%",
                height: "100%",
                position: "relative",
                padding: 4,
                borderRadius: "sm",
                backgroundColor: "sys.surface-container-low",
              }}
            >
              <Box
                sx={{
                  width: "50%",
                  px: 8,
                  py: 16,
                  borderRadius: "sm",
                  backgroundColor: "sys.surface-container-lowest",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "row-reverse",
                    gap: 16,
                    justifyContent: "stretch",
                  }}
                >
                  <div>
                    <RequestSubmit request$={request$} />
                  </div>
                  <Box sx={{ flex: 1, height: "100%" }}>
                    <EditorContainer />
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  width: "50%",
                  height: "100%",
                  overflowX: "hidden",
                  overflowY: "auto",
                  padding: 8,
                }}
              >
                {respEl}
              </Box>
            </Box>
          </Box>
        </Box>
      );
    };
  },
);

const Tips = () => {
  const p = PlatformProvider.use();

  return (
    <Box sx={{ p: 8, textStyle: "sys.body-medium" }}>
      <Markdown
        text={`
通过 JSON 构造请求参数

\`\`\`json
{
   "{OperationID}": {
      ...{OperationParameters}
   }
}
\`\`\`

快捷键
* \`${p.os.mac ? "CMD" : "Ctrl"} + Enter\`：发起请求
* \`Shirt + Space\`：代码补全提示
      `}
      />
    </Box>
  );
};

const RequestSubmit = component$(
  {
    request$: t.custom<ReturnType<typeof useRequest>>(),
  },
  ({ request$ }, {}) => {
    const ctx = EditorContextProvider.use();
    const p = PlatformProvider.use();

    const execute = (view: EditorView): boolean => {
      forceLinting(view);

      setTimeout(() => {
        if (diagnosticCount(view.state) === 0) {
          request$.next(JSON.parse(view.state.doc.sliceString(0)));
        }
      });

      return true;
    };

    useExtension(() => [
      keymap.of([
        {
          key: `${p.os.mac ? "Cmd" : "Ctrl"}-Enter`,
          run: execute,
        },
      ]),
    ]);

    return rx(
      request$.requesting$,
      render((requesting) => (
        <Tooltip title={`请求 (${p.os.mac ? "Cmd" : "Ctrl"} + Enter)`}>
          <IconButton
            disabled={requesting}
            onClick={async () => {
              const view = await firstValueFrom(ctx.view$);
              view && execute(view);
            }}
          >
            <Icon path={mdiPlayCircle} />
          </IconButton>
        </Tooltip>
      )),
    );
  },
);

export const Documents = component$(
  {
    schema: t.custom<JSONSchema>(),
    schemaBreadcrumbs$: t.custom<ObservableRef<SchemaType[]>>(),
  },
  (props) => {
    const instancePath$ = observableRef([] as string[]);
    const lsp = new LSP(props.schema);

    rx(
      instancePath$,
      distinctUntilChanged(isEqual),
      rxMap((instancePath) => {
        let s = lsp.schemaAt(instancePath);
        while (
          s &&
          !(
            s.underlying instanceof SchemaObjectType ||
            s.underlying instanceof SchemaUnionType
          )
        ) {
          s = s.parent ?? null;
        }
        let schemaBreadcrumbs = s?.parents.filter(
          (p) => !(p.underlying instanceof SchemaRefType),
        );
        return schemaBreadcrumbs ?? [];
      }),
      subscribeUntilUnmount(props.schemaBreadcrumbs$),
    );

    useExtension(() =>
      EditorView.updateListener.of((u) => {
        instancePath$.next(
          selectionAt(u.state, u.state.selection.main.head).instancePath,
        );
      }),
    );

    const schemaBreadcrumbsEl = rx(
      props.schemaBreadcrumbs$,
      render((schemaBreadcrumbs) => (
        <>
          {map(
            schemaBreadcrumbs.filter((s) => !(s instanceof SchemaRefType)),
            (schema, i) => (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {i > 0 && <Box sx={{ opacity: 0.5, mx: 4 }}>/</Box>}
                <TypeLink
                  sx={{
                    opacity: i < schemaBreadcrumbs.length - 1 ? 0.5 : 1,
                  }}
                  onClick={() =>
                    props.schemaBreadcrumbs$.next((schemaBreadcrumbs) =>
                      schemaBreadcrumbs.slice(0, i + 1),
                    )
                  }
                >
                  {schema.meta("x-id") || "#"}
                </TypeLink>
              </Box>
            ),
          )}
        </>
      )),
    );

    const schemaViewEl = rx(
      props.schemaBreadcrumbs$,
      render((schemaBreadcrumbs) => {
        return <RequestSchemaView schema={last(schemaBreadcrumbs)} />;
      }),
    );

    return () => (
      <Box
        sx={{
          width: "24vw",
          maxWidth: 320,
        }}
      >
        <RequestSchemaProvider
          lsp={lsp}
          schemaBreadcrumbs$={props.schemaBreadcrumbs$}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              textStyle: "sys.label-large",
              fontFamily: "code",
              px: 4,
            }}
          >
            {schemaBreadcrumbsEl}
          </Box>
          <Box
            sx={{
              flex: 1,
              py: 8,
              px: 8,
              width: "100%",
              height: "100%",
              overflow: "auto",
            }}
          >
            {schemaViewEl}
          </Box>
        </RequestSchemaProvider>
      </Box>
    );
  },
);
